/**
 * Daftra ERP integration — shared types.
 *
 * SERVER-SIDE ONLY. These types model the Daftra API v1 request/response
 * payloads (https://docs.daftara.dev) and the Cesro-side sync result shape.
 */

/** Sync status persisted on the Cesro `order` table. */
export type DaftraSyncStatus = "not_synced" | "synced" | "failed";

// ─── Daftra API payloads ────────────────────────────────────────────────────

/**
 * Daftra client (customer) payload. Wrapped as `{ Client: ClientBase }` in the
 * POST /clients request body.
 *
 * Source: "Add New Client" — POST /clients{format}
 */
export interface DaftraClientBase {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  notes?: string;
  /** 2 => Individual, 3 => Business */
  type?: 2 | 3;
}

export interface DaftraClientRequest {
  Client: DaftraClientBase;
}

/**
 * Daftra invoice line item.
 *
 * Source: "Add New Invoice" — InvoiceItem array.
 */
export interface DaftraInvoiceItem {
  item: string;
  description?: string;
  unit_price: number;
  quantity: number;
  /** Absolute or percentage discount, paired with discount_type. */
  discount?: number;
  /** 1 => Percentage, 2 => Absolute */
  discount_type?: 1 | 2;
  product_id?: number;
}

/**
 * Daftra invoice header.
 *
 * Source: "Add New Invoice" — Invoice object. `store_id` and `client_id` are
 * the required fields on the Daftra side.
 */
export interface DaftraInvoiceBase {
  store_id: number;
  client_id: number;
  client_business_name?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  client_address1?: string;
  client_city?: string;
  client_state?: string;
  client_postal_code?: string;
  client_country_code?: string;
  currency_code?: string;
  date?: string;
  /** Absolute discount amount (paired with discount = 0). */
  discount_amount?: number;
  shipping_amount?: number | null;
  notes?: string;
}

export interface DaftraInvoiceRequest {
  Invoice: DaftraInvoiceBase;
  InvoiceItem: DaftraInvoiceItem[];
}

/**
 * Generic Daftra create response (clients, invoices, ...).
 * e.g. `{ code: 202, result: "successful", id: "2415" }`
 */
export interface DaftraCreateResponse {
  code?: number;
  result?: string;
  id?: string | number;
  message?: string;
  // biome-ignore lint/suspicious/noExplicitAny: validation errors are dynamic
  validation_errors?: Record<string, any>;
}

/** OAuth token response from POST /v2/oauth/token. */
export interface DaftraTokenResponse {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
}

// ─── Cesro-side result shapes ───────────────────────────────────────────────

/** Result of a low-level Daftra HTTP request. */
export interface DaftraRequestResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

/** Result of testConnection(). Safe to surface to staff dashboards. */
export interface DaftraConnectionResult {
  ok: boolean;
  enabled: boolean;
  configured: boolean;
  message: string;
}

/** Result of syncOrderToDaftra(). */
export interface DaftraSyncResult {
  status: DaftraSyncStatus;
  daftraCustomerId: string | null;
  daftraInvoiceId: string | null;
  error: string | null;
}
