/**
 * Daftra ERP integration — mapper.
 *
 * SERVER-SIDE ONLY. Transforms a Cesro order into generic Daftra API payloads
 * (a client + a sales invoice). The mapper is pure: it performs no I/O and
 * makes no assumptions about Daftra IDs that must be resolved at runtime
 * (client_id, store_id, product_id) beyond accepting them as inputs.
 */

import type {
  DaftraClientRequest,
  DaftraInvoiceItem,
  DaftraInvoiceRequest,
} from "./types";

/**
 * Minimal Cesro order shape needed for mapping. Kept local to the integration
 * so the mapper stays decoupled from the full Drizzle row type.
 */
export interface CesroOrderForDaftra {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: string | number;
  shipping: string | number;
  discount: string | number | null;
  total: string | number;
  notes: string | null;
  items: CesroOrderItemForDaftra[];
}

export interface CesroOrderItemForDaftra {
  productId: string;
  name: string;
  quantity: number;
  /** Unit price as stored on the order (string decimal or number). */
  price: string | number;
  discountPrice: string | number | null;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function getCurrencyCode(): string {
  return process.env.VITE_CURRENCY?.trim() || "EGP";
}

/** Today's date in Daftra's expected `YYYY-MM-DD` format. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Normalizes a free-form country value into a Daftra-valid ISO-2 code.
 * Daftra rejects anything that is not a recognized country code (e.g. it
 * returns `country_code: "Invalid country"` for "Egypt"). To stay safe we only
 * emit a value when we are confident it is a 2-letter code; otherwise we omit
 * the field entirely.
 *
 * - missing/null/empty            => undefined
 * - exactly 2 letters             => uppercased (e.g. "eg" => "EG")
 * - "Egypt" / "EGY" (any case)    => "EG"
 * - anything else                 => undefined
 */
function normalizeCountryCode(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const upper = trimmed.toUpperCase();
  if (upper === "EGYPT" || upper === "EGY") {
    return "EG";
  }

  return undefined;
}

/**
 * Splits a free-form customer name into first/last for Daftra fields.
 * Daftra requires first_name/last_name on clients; we keep the full name as
 * the business_name (shop name) for B2B wholesale customers.
 */
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [first, ...rest] = parts;
  if (!first) return { first: fullName || "Customer", last: "" };
  return { first, last: rest.join(" ") };
}

/**
 * Builds the Daftra "Add New Client" payload from a Cesro order.
 * The shop / customer name is used as the business name (B2B wholesale).
 */
export function mapOrderToDaftraClient(
  order: CesroOrderForDaftra,
): DaftraClientRequest {
  const { first, last } = splitName(order.customerName);
  return {
    Client: {
      business_name: order.customerName,
      first_name: first,
      last_name: last,
      email: order.customerEmail,
      phone1: order.customerPhone,
      address1: order.shippingAddress,
      city: order.shippingCity,
      state: order.shippingState ?? undefined,
      postal_code: order.shippingPostalCode ?? undefined,
      country_code: normalizeCountryCode(order.shippingCountry),
      notes: `Cesro order ref: ${order.id}`,
      // Wholesale buyers are businesses.
      type: 3,
    },
  };
}

/**
 * Builds the Daftra "Add New Invoice" payload from a Cesro order.
 *
 * @param order     The accepted Cesro order.
 * @param clientId  Resolved Daftra client id (required by Daftra).
 * @param storeId   Daftra store id (required; from DAFTRA_STORE_ID).
 */
export function mapOrderToDaftraInvoice(
  order: CesroOrderForDaftra,
  clientId: number,
  storeId: number,
): DaftraInvoiceRequest {
  const { first, last } = splitName(order.customerName);

  const items: DaftraInvoiceItem[] = order.items.map((line) => {
    const unitPrice = toNumber(line.price);
    const discounted = toNumber(line.discountPrice);
    // Per-unit absolute discount when a discount price is present.
    const perUnitDiscount =
      discounted > 0 && discounted < unitPrice ? unitPrice - discounted : 0;

    return {
      item: line.name,
      unit_price: unitPrice,
      quantity: line.quantity,
      discount: perUnitDiscount,
      discount_type: 2, // absolute
    };
  });

  const orderDiscount = toNumber(order.discount);
  const shipping = toNumber(order.shipping);

  return {
    Invoice: {
      store_id: storeId,
      client_id: clientId,
      client_business_name: order.customerName,
      client_first_name: first,
      client_last_name: last,
      client_email: order.customerEmail,
      client_address1: order.shippingAddress,
      client_city: order.shippingCity,
      client_state: order.shippingState ?? undefined,
      client_postal_code: order.shippingPostalCode ?? undefined,
      client_country_code: normalizeCountryCode(order.shippingCountry),
      currency_code: getCurrencyCode(),
      date: today(),
      discount_amount: orderDiscount,
      shipping_amount: shipping > 0 ? shipping : null,
      notes: [order.notes, `Cesro order ref: ${order.id}`]
        .filter(Boolean)
        .join("\n"),
    },
    InvoiceItem: items,
  };
}
