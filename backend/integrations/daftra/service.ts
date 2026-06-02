/**
 * Daftra ERP integration — service layer.
 *
 * SERVER-SIDE ONLY. High-level operations the rest of the backend can call:
 *  - testConnection(): safe connectivity / configuration check.
 *  - syncOrderToDaftra(orderId): push an accepted order to Daftra.
 *
 * IMPORTANT: syncOrderToDaftra is NOT wired into the order-acceptance flow.
 * Nothing in this module triggers automatically. A future task will connect it
 * once the Daftra account (store id, product ids, auth) is fully provisioned.
 */

import { eq } from "drizzle-orm";
import { getDaftraConfig, isDaftraReady } from "#root/shared/config/daftra";
import { db } from "#root/shared/database/drizzle/db";
import { order, orderItem } from "#root/shared/database/drizzle/schema";
import { daftraRequest } from "./client";
import {
  type CesroOrderForDaftra,
  mapOrderToDaftraClient,
  mapOrderToDaftraInvoice,
} from "./mapper";
import type {
  DaftraConnectionResult,
  DaftraCreateResponse,
  DaftraSyncResult,
} from "./types";

/**
 * Safe connectivity check. Never throws. When Daftra is disabled or not
 * configured it short-circuits without making a network call.
 */
export async function testConnection(): Promise<DaftraConnectionResult> {
  const config = getDaftraConfig();
  const configured = Boolean(config.baseUrl) && Boolean(config.accessToken);

  if (!config.enabled) {
    return {
      ok: false,
      enabled: false,
      configured,
      message: "Daftra integration is disabled (DAFTRA_ENABLED is not 'true').",
    };
  }
  if (!configured) {
    return {
      ok: false,
      enabled: true,
      configured: false,
      message:
        "Daftra is enabled but missing DAFTRA_BASE_URL or DAFTRA_ACCESS_TOKEN.",
    };
  }

  // Lightweight authenticated GET to confirm credentials work.
  const result = await daftraRequest("/clients.json?limit=1", {
    method: "GET",
  });

  if (result.ok) {
    return {
      ok: true,
      enabled: true,
      configured: true,
      message: "Successfully connected to Daftra.",
    };
  }

  return {
    ok: false,
    enabled: true,
    configured: true,
    message: result.error ?? "Failed to connect to Daftra.",
  };
}

function extractCreatedId(
  response: DaftraCreateResponse | null,
): string | null {
  if (!response || response.id === undefined || response.id === null) {
    return null;
  }
  return String(response.id);
}

/**
 * Persists the outcome of a sync attempt onto the order row.
 */
async function persistSyncResult(
  orderId: string,
  result: DaftraSyncResult,
  payload: unknown,
): Promise<void> {
  const client = db();
  await client
    .update(order)
    .set({
      daftraSyncStatus: result.status,
      daftraCustomerId: result.daftraCustomerId,
      daftraInvoiceId: result.daftraInvoiceId,
      daftraOrderId: result.daftraInvoiceId,
      daftraLastSyncError: result.error,
      daftraSyncedAt: result.status === "synced" ? new Date() : null,
      daftraPayload: payload as object,
    })
    .where(eq(order.id, orderId))
    .execute();
}

/**
 * Syncs a single Cesro order to Daftra as a client + sales invoice.
 *
 * Safe by design:
 *  - Returns a failed result (and records it) instead of throwing.
 *  - No-ops cleanly when Daftra is not ready.
 *  - Does NOT enforce that the order is "accepted" — the caller is responsible
 *    for only invoking this after acceptance. This is intentionally NOT yet
 *    connected to the acceptance flow.
 *
 * @param orderId Cesro order id to sync.
 */
export async function syncOrderToDaftra(
  orderId: string,
): Promise<DaftraSyncResult> {
  if (!isDaftraReady()) {
    return {
      status: "not_synced",
      daftraCustomerId: null,
      daftraInvoiceId: null,
      error: "Daftra is not enabled or not configured.",
    };
  }

  // Load the order + its items.
  const client = db();
  const orders = await client
    .select()
    .from(order)
    .where(eq(order.id, orderId))
    .limit(1)
    .execute();

  const found = orders[0];
  const loaded = found
    ? {
        found,
        items: await client
          .select()
          .from(orderItem)
          .where(eq(orderItem.orderId, orderId))
          .execute(),
      }
    : null;

  if (!loaded) {
    return {
      status: "failed",
      daftraCustomerId: null,
      daftraInvoiceId: null,
      error: `Order ${orderId} not found.`,
    };
  }

  const cesroOrder: CesroOrderForDaftra = {
    id: loaded.found.id,
    customerName: loaded.found.customerName,
    customerEmail: loaded.found.customerEmail,
    customerPhone: loaded.found.customerPhone,
    shippingAddress: loaded.found.shippingAddress,
    shippingCity: loaded.found.shippingCity,
    shippingState: loaded.found.shippingState,
    shippingPostalCode: loaded.found.shippingPostalCode,
    shippingCountry: loaded.found.shippingCountry,
    subtotal: loaded.found.subtotal,
    shipping: loaded.found.shipping,
    discount: loaded.found.discount,
    total: loaded.found.total,
    notes: loaded.found.notes,
    items: loaded.items.map((line) => ({
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      price: line.price,
      discountPrice: line.discountPrice,
    })),
  };

  // 1) Create / register the customer in Daftra.
  const clientPayload = mapOrderToDaftraClient(cesroOrder);
  const clientResult = await daftraRequest<DaftraCreateResponse>(
    "/clients.json",
    { method: "POST", body: clientPayload },
  );

  const daftraCustomerId = extractCreatedId(clientResult.data);
  if (!clientResult.ok || !daftraCustomerId) {
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId: null,
      daftraInvoiceId: null,
      error:
        clientResult.error ??
        clientResult.data?.message ??
        "Failed to create Daftra client.",
    };
    await persistSyncResult(orderId, failed, { client: clientPayload });
    return failed;
  }

  // 2) Create the sales invoice for that customer.
  const invoicePayload = mapOrderToDaftraInvoice(
    cesroOrder,
    Number.parseInt(daftraCustomerId, 10),
  );
  const invoiceResult = await daftraRequest<DaftraCreateResponse>(
    "/invoices.json",
    { method: "POST", body: invoicePayload },
  );

  const daftraInvoiceId = extractCreatedId(invoiceResult.data);
  if (!invoiceResult.ok || !daftraInvoiceId) {
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId,
      daftraInvoiceId: null,
      error:
        invoiceResult.error ??
        invoiceResult.data?.message ??
        "Failed to create Daftra invoice.",
    };
    await persistSyncResult(orderId, failed, {
      client: clientPayload,
      invoice: invoicePayload,
    });
    return failed;
  }

  const success: DaftraSyncResult = {
    status: "synced",
    daftraCustomerId,
    daftraInvoiceId,
    error: null,
  };
  await persistSyncResult(orderId, success, {
    client: clientPayload,
    invoice: invoicePayload,
  });
  return success;
}
