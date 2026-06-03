/**
 * Daftra ERP Integration Configuration
 *
 * Daftra is the real ERP / accounting / inventory system. Cesro pushes an
 * accepted wholesale order to Daftra as a sales invoice.
 *
 * SERVER-SIDE ONLY. None of these accessors must ever be imported into
 * frontend / client bundles — they read secrets from process.env.
 *
 * Environment variables:
 * - DAFTRA_ENABLED        "true" to turn the integration on (default off)
 * - DAFTRA_BASE_URL       e.g. https://yoursubdomain.daftra.com/api2
 * - DAFTRA_API_KEY        APIKEY header credential (preferred)
 * - DAFTRA_CLIENT_ID      OAuth client id
 * - DAFTRA_CLIENT_SECRET  OAuth client secret
 * - DAFTRA_ACCESS_TOKEN   Bearer access token
 * - DAFTRA_REFRESH_TOKEN  OAuth refresh token
 */

function isNonEmpty(val: string | undefined): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

/** Whether the integration is explicitly enabled via env flag. */
export function isDaftraEnabled(): boolean {
  return process.env.DAFTRA_ENABLED === "true";
}

/**
 * Whether Daftra has the minimum credentials needed to talk to the API.
 * Requires a base URL and at least an API key or access token.
 */
export function isDaftraConfigured(): boolean {
  return (
    isNonEmpty(process.env.DAFTRA_BASE_URL) &&
    (isNonEmpty(process.env.DAFTRA_API_KEY) ||
      isNonEmpty(process.env.DAFTRA_ACCESS_TOKEN))
  );
}

/**
 * Whether Daftra is both enabled and configured. Use this as the single
 * gate before performing any real API call.
 */
export function isDaftraReady(): boolean {
  return isDaftraEnabled() && isDaftraConfigured();
}

/** Config accessor (server-side only). */
export function getDaftraConfig() {
  return {
    enabled: isDaftraEnabled(),
    baseUrl: (process.env.DAFTRA_BASE_URL ?? "").replace(/\/+$/, ""),
    apiKey: process.env.DAFTRA_API_KEY ?? "",
    clientId: process.env.DAFTRA_CLIENT_ID ?? "",
    clientSecret: process.env.DAFTRA_CLIENT_SECRET ?? "",
    accessToken: process.env.DAFTRA_ACCESS_TOKEN ?? "",
    refreshToken: process.env.DAFTRA_REFRESH_TOKEN ?? "",
  };
}

export type DaftraConfig = ReturnType<typeof getDaftraConfig>;
