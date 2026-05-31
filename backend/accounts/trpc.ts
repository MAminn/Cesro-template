import {
  runBackendEffect,
  serializeBackendEffectResult,
} from "#root/shared/backend/effect";
import { adminProcedure, t } from "#root/shared/trpc/server";
import { provideDatabase } from "#root/shared/trpc/server";
import {
  createAccount,
  createAccountSchema,
  deleteAccount,
  deleteAccountSchema,
  listAccounts,
  updateAccount,
  updateAccountSchema,
} from "./service";

const listAccountsProcedure = adminProcedure.query(async ({ ctx }) => {
  return await runBackendEffect(
    listAccounts(ctx.clientSession).pipe(provideDatabase(ctx)),
  ).then(serializeBackendEffectResult);
});

const createAccountProcedure = adminProcedure
  .input(createAccountSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      createAccount(input, ctx.clientSession).pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  });

const updateAccountProcedure = adminProcedure
  .input(updateAccountSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      updateAccount(input, ctx.clientSession).pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  });

const deleteAccountProcedure = adminProcedure
  .input(deleteAccountSchema)
  .mutation(async ({ ctx, input }) => {
    return await runBackendEffect(
      deleteAccount(input, ctx.clientSession).pipe(provideDatabase(ctx)),
    ).then(serializeBackendEffectResult);
  });

export const accountsRouter = t.router({
  list: listAccountsProcedure,
  create: createAccountProcedure,
  update: updateAccountProcedure,
  delete: deleteAccountProcedure,
});
