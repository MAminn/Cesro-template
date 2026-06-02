/**
 * Daftra ERP integration — tRPC router.
 *
 * SERVER-SIDE ONLY. Exposes manual, staff-triggered operations:
 *  - testConnection: safe connectivity / configuration check.
 *  - syncOrder: manually push a single accepted order to Daftra.
 *
 * Both procedures are restricted to admin/accountant via managementProcedure.
 * The underlying service enforces its own safety guards (accepted-only,
 * no-duplicate, non-empty). Nothing here runs automatically.
 */

import { z } from "zod";
import { managementProcedure, t } from "#root/shared/trpc/server";
import { syncOrderToDaftra, testConnection } from "./service";

const syncOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const daftraRouter = t.router({
  testConnection: managementProcedure.mutation(async () => {
    return await testConnection();
  }),

  syncOrder: managementProcedure
    .input(syncOrderSchema)
    .mutation(async ({ input }) => {
      return await syncOrderToDaftra(input.orderId);
    }),
});
