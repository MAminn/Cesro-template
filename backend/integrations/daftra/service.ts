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
 *  - Only syncs accepted orders (status "processing").
 *  - Skips orders that are already synced (no duplicate invoices).
 *  - Refuses orders with no line items.
 *  - This is intentionally NOT yet connected to the acceptance flow; the
 *    caller must invoke it explicitly.
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

  // Guard 1 — Prevent duplicate sync. If the order already has Daftra IDs or
  // is marked synced, return the stored result without calling the Daftra API.
  if (
    loaded.found.daftraSyncStatus === "synced" ||
    loaded.found.daftraInvoiceId ||
    loaded.found.daftraOrderId
  ) {
    console.info(
      `[Daftra] Sync skipped for order ${orderId}: already synced ` +
        `(invoiceId=${loaded.found.daftraInvoiceId ?? "null"}).`,
    );
    return {
      status: "synced",
      daftraCustomerId: loaded.found.daftraCustomerId ?? null,
      daftraInvoiceId:
        loaded.found.daftraInvoiceId ?? loaded.found.daftraOrderId ?? null,
      error: null,
    };
  }

  // Guard 2 — Only accepted orders (status "processing") may be synced.
  if (loaded.found.status !== "processing") {
    const error = "Only accepted orders can be synced to Daftra.";
    console.warn(
      `[Daftra] Sync blocked for order ${orderId}: status is ` +
        `"${loaded.found.status}", expected "processing". ${error}`,
    );
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId: null,
      daftraInvoiceId: null,
      error,
    };
    await persistSyncResult(orderId, failed, null);
    return failed;
  }

  // Guard 3 — Refuse to sync an order with no line items.
  if (loaded.items.length === 0) {
    const error = "Cannot sync order with no items.";
    console.warn(`[Daftra] Sync failed for order ${orderId}: ${error}`);
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId: null,
      daftraInvoiceId: null,
      error,
    };
    await persistSyncResult(orderId, failed, null);
    return failed;
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

  // 2) Resolve and validate the Daftra store id. This must be the real Daftra
  // store/warehouse id (DAFTRA_STORE_ID), never a Cesro internal UUID.
  const config = getDaftraConfig();
  const daftraStoreId = Number.parseInt(config.storeId, 10);
  if (!Number.isInteger(daftraStoreId) || daftraStoreId <= 0) {
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId,
      daftraInvoiceId: null,
      error: "DAFTRA_STORE_ID is required to create Daftra invoice.",
    };
    await persistSyncResult(orderId, failed, { client: clientPayload });
    return failed;
  }

  // 3) Create the sales invoice for that customer.
  const invoicePayload = mapOrderToDaftraInvoice(
    cesroOrder,
    Number.parseInt(daftraCustomerId, 10),
    daftraStoreId,
  );
  const invoiceResult = await daftraRequest<DaftraCreateResponse>(
    "/invoices.json",
    { method: "POST", body: invoicePayload },
  );

  const daftraInvoiceId = extractCreatedId(invoiceResult.data);
  if (!invoiceResult.ok || !daftraInvoiceId) {
    // Verbose, secret-free diagnostics. The payload contains no APIKEY (auth is
    // injected at the HTTP-client layer), so it is safe to log in full here.
    console.error(
      `[Daftra] Invoice creation failed for order ${orderId}. Payload:`,
      JSON.stringify(invoicePayload),
    );
    console.error(
      `[Daftra] Invoice result — status=${invoiceResult.status}, ` +
        `error=${invoiceResult.error ?? "null"}`,
    );
    console.error(
      "[Daftra] Invoice response data:",
      JSON.stringify(invoiceResult.data ?? null),
    );

    const detailedError =
      invoiceResult.error ??
      invoiceResult.data?.message ??
      "Failed to create Daftra invoice.";
    const failed: DaftraSyncResult = {
      status: "failed",
      daftraCustomerId,
      daftraInvoiceId: null,
      error: detailedError,
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
