import { initTRPC, TRPCError } from "@trpc/server";
import {
  DatabaseClientService,
  type DatabaseClient,
} from "#root/shared/database/drizzle/db.js";
import { Effect } from "effect";
import superjson from "superjson";
import type { Context } from "./context.server";
import { ServerError } from "#root/shared/error/server.js";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires logged-in user
 * Blocks guest users
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clientSession) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      clientSession: ctx.clientSession,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.clientSession.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      clientSession: ctx.clientSession,
    },
  });
});

/**
 * Management procedure - admin OR accountant.
 * Used for wholesale order management and dashboard operations that the
 * accountant role is allowed to perform (treated as admin-level for now).
 */
export const managementProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const role = ctx.clientSession.role;
    if (role !== "admin" && role !== "accountant") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Staff (admin or accountant) access required",
      });
    }
    return next({
      ctx: {
        ...ctx,
        clientSession: ctx.clientSession,
      },
    });
  },
);

/** Alias: dashboard access = admin or accountant. */
export const staffProcedure = managementProcedure;

/**
 * Sales procedure - admin, accountant OR sales.
 * Used for the wholesale order creation flow.
 */
export const salesProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.clientSession.role;
  if (role !== "admin" && role !== "accountant" && role !== "sales") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sales access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      clientSession: ctx.clientSession,
    },
  });
});

export const provideDatabase = (ctx: { db: DatabaseClient }) =>
  Effect.provideService(DatabaseClientService, ctx.db);
