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
  if (!config.accessToken) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Daftra access token is not configured.",
    };
  }

  const url = `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.accessToken}`,
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
      return {
        ok: false,
        status: response.status,
        data,
        error:
          parseError ?? `Daftra request failed with status ${response.status}.`,
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
