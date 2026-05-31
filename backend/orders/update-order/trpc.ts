import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { adminProcedure, provideDatabase } from "#root/shared/trpc/server";
import { updateOrder, updateOrderSchema } from "./service";

export const updateOrderProcedure = adminProcedure
  .input(updateOrderSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      updateOrder(input, ctx.clientSession).pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  });
