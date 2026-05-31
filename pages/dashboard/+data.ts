import { getAdminOverview } from "#root/backend/dashboard/admin-overview/admin-overview";
import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { DatabaseClientService } from "#root/shared/database/drizzle/db";
import { Effect } from "effect";
import { redirect } from "vike/abort";

export async function data(ctx: Vike.PageContext) {
  const session = ctx.clientSession;

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    } as const;
  }

  // Sales staff have their own dedicated wholesale order flow.
  if (session.role === "sales") {
    throw redirect("/sales/orders/new");
  }

  // Single-shop mode: admins and accountants can access the dashboard.
  if (session.role !== "admin" && session.role !== "accountant") {
    throw redirect("/");
  }

  const fetchAdminOverview = await runBackendEffect(
    getAdminOverview({}, ctx.clientSession).pipe(
      Effect.provideService(DatabaseClientService, ctx.db),
    ),
  ).then(serializeBackendEffectResult);

  return fetchAdminOverview;
}

export type Data = Awaited<ReturnType<typeof data>>;
