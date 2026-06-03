/**
 * Daftra ERP integration — low-level HTTP client.
 *
 * SERVER-SIDE ONLY. Wraps fetch with the Daftra base URL + bearer auth.
 * It never throws on HTTP/network errors; instead it returns a structured
 * {@link DaftraRequestResult} so callers can decide how to react. This keeps
 * the integration safe to call even when Daftra is misconfigured.
 */

import { getDaftraConfig } from "#root/shared/config/daftra";
import type { DaftraRequestResult } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

interface DaftraRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** JSON body; will be stringified. */
  body?: unknown;
  /** Per-request timeout override. */
  timeoutMs?: number;
}

/**
 * Extracts a human-readable error description from a Daftra error response.
 * Daftra returns validation failures in a few shapes (`message`, `error`,
 * `errors`); we flatten whatever is present so callers (and the dashboard)
 * can see the real reason behind a non-2xx status. Falls back to the raw body.
 */
function extractDaftraErrorDetails(data: unknown, raw: string): string | null {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const parts: string[] = [];

    if (typeof obj.message === "string" && obj.message.trim()) {
      parts.push(obj.message.trim());
    }
    if (typeof obj.error === "string" && obj.error.trim()) {
      parts.push(obj.error.trim());
    }
    if (obj.errors && typeof obj.errors === "object") {
      try {
        parts.push(JSON.stringify(obj.errors));
      } catch {
        // ignore non-serializable errors object
      }
    }

    if (parts.length > 0) return parts.join(" ");

    try {
      return JSON.stringify(obj);
    } catch {
      // fall through to raw
    }
  }

  const trimmed = raw?.trim();
  return trimmed ? trimmed.slice(0, 500) : null;
}

/**
 * Performs an authenticated JSON request against the Daftra API.
 *
 * @param path API path relative to the configured base URL, e.g. "/clients.json".
 */
export async function daftraRequest<T = unknown>(
  path: string,
  options: DaftraRequestOptions = {},
): Promise<DaftraRequestResult<T>> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const config = getDaftraConfig();

  if (!config.baseUrl) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Daftra base URL is not configured.",
    };
  }
  if (!config.apiKey && !config.accessToken) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Daftra API key or access token is not configured.",
    };
  }

  const url = `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const authHeaders: Record<string, string> = config.apiKey
      ? { APIKEY: config.apiKey }
      : { Authorization: `Bearer ${config.accessToken}` };

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    let data: T | null = null;
    let parseError: string | null = null;
    const raw = await response.text();
    if (raw) {
      try {
        data = JSON.parse(raw) as T;
      } catch {
        parseError = "Failed to parse Daftra response as JSON.";
      }
    }

    if (!response.ok) {
      // Surface the real Daftra validation details (e.g. why a 400 happened)
      // so the dashboard shows actionable errors instead of just the status.
      const details = extractDaftraErrorDetails(data, raw);
      const base = `Daftra request failed with status ${response.status}.`;
      return {
        ok: false,
        status: response.status,
        data,
        error: parseError ?? (details ? `${base} ${details}` : base),
      };
    }

    return {
      ok: parseError === null,
      status: response.status,
      data,
      error: parseError,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? `Daftra request timed out after ${timeoutMs}ms.`
        : err instanceof Error
          ? err.message
          : "Unknown Daftra request error.";
    return { ok: false, status: 0, data: null, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
