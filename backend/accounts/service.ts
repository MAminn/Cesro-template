import { query } from "#root/shared/database/drizzle/db.js";
import * as Tables from "#root/shared/database/drizzle/schema.js";
import { ServerError } from "#root/shared/error/server.js";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { hashPassword } from "#root/backend/auth/shared/utils";
import { Effect } from "effect";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const STAFF_ROLES = ["admin", "accountant", "sales"] as const;

export const createAccountSchema = z.object({
  name: z.string().trim().nonempty("Name is required").max(255),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255),
  role: z.enum(["admin", "accountant", "sales"]),
});

export const updateAccountSchema = z
  .object({
    userId: z.string().uuid(),
    role: z.enum(["admin", "accountant", "sales"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: "Nothing to update",
  });

export const deleteAccountSchema = z.object({
  userId: z.string().uuid(),
});

export const createAccount = (
  input: z.infer<typeof createAccountSchema>,
  _session: ClientSession,
) =>
  Effect.gen(function* ($) {
    const existing = yield* $(
      query(
        async (db) =>
          await db
            .select({ id: Tables.user.id })
            .from(Tables.user)
            .where(eq(Tables.user.email, input.email)),
      ),
      Effect.map((rows) => rows[0]),
    );

    if (existing) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "UserAlreadyExists",
            statusCode: 400,
            clientMessage: "An account with this email already exists",
          }),
        ),
      );
    }

    const passwordDigest = yield* $(hashPassword(input.password));

    const created = yield* $(
      query(async (db) => {
        return await db
          .insert(Tables.user)
          .values({
            name: input.name,
            email: input.email,
            phone: input.phone,
            passwordDigest,
            role: input.role,
            // Staff accounts are created ready-to-use.
            emailVerified: true,
            isActive: true,
          })
          .returning({
            id: Tables.user.id,
            name: Tables.user.name,
            email: Tables.user.email,
            phone: Tables.user.phone,
            role: Tables.user.role,
            isActive: Tables.user.isActive,
            createdAt: Tables.user.createdAt,
          });
      }),
      Effect.map((rows) => rows[0]),
    );

    return created;
  });

export const listAccounts = (_session: ClientSession) =>
  Effect.gen(function* ($) {
    const accounts = yield* $(
      query(async (db) => {
        return await db
          .select({
            id: Tables.user.id,
            name: Tables.user.name,
            email: Tables.user.email,
            phone: Tables.user.phone,
            role: Tables.user.role,
            isActive: Tables.user.isActive,
            createdAt: Tables.user.createdAt,
          })
          .from(Tables.user)
          .where(inArray(Tables.user.role, [...STAFF_ROLES]))
          .orderBy(Tables.user.createdAt);
      }),
    );

    return accounts;
  });

export const updateAccount = (
  input: z.infer<typeof updateAccountSchema>,
  session: ClientSession,
) =>
  Effect.gen(function* ($) {
    const target = yield* $(
      query(
        async (db) =>
          await db
            .select({
              id: Tables.user.id,
              role: Tables.user.role,
              isActive: Tables.user.isActive,
            })
            .from(Tables.user)
            .where(eq(Tables.user.id, input.userId)),
      ),
      Effect.map((rows) => rows[0]),
    );

    if (!target) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "UserNotFound",
            statusCode: 404,
            clientMessage: "Account not found",
          }),
        ),
      );
    }

    // Prevent admins from deactivating or demoting themselves (lock-out guard).
    if (input.userId === session.id) {
      if (input.isActive === false) {
        return yield* $(
          Effect.fail(
            new ServerError({
              tag: "Forbidden",
              statusCode: 400,
              clientMessage: "You cannot deactivate your own account",
            }),
          ),
        );
      }
      if (input.role !== undefined && input.role !== "admin") {
        return yield* $(
          Effect.fail(
            new ServerError({
              tag: "Forbidden",
              statusCode: 400,
              clientMessage: "You cannot change your own role",
            }),
          ),
        );
      }
    }

    const updated = yield* $(
      query(async (db) => {
        return await db
          .update(Tables.user)
          .set({
            ...(input.role !== undefined ? { role: input.role } : {}),
            ...(input.isActive !== undefined
              ? { isActive: input.isActive }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(Tables.user.id, input.userId))
          .returning({
            id: Tables.user.id,
            name: Tables.user.name,
            email: Tables.user.email,
            phone: Tables.user.phone,
            role: Tables.user.role,
            isActive: Tables.user.isActive,
            createdAt: Tables.user.createdAt,
          });
      }),
      Effect.map((rows) => rows[0]),
    );

    return updated;
  });

export const deleteAccount = (
  input: z.infer<typeof deleteAccountSchema>,
  session: ClientSession,
) =>
  Effect.gen(function* ($) {
    if (input.userId === session.id) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            statusCode: 400,
            clientMessage: "You cannot delete your own account",
          }),
        ),
      );
    }

    // Orders reference the creating user with onDelete restrict, so a user who
    // has created orders cannot be hard-deleted. Guide the admin to deactivate.
    const orderCount = yield* $(
      query(
        async (db) =>
          await db
            .select({ count: count() })
            .from(Tables.order)
            .where(eq(Tables.order.userId, input.userId)),
      ),
      Effect.map((rows) => Number(rows[0]?.count ?? 0)),
    );

    if (orderCount > 0) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            statusCode: 400,
            clientMessage:
              "This account has associated orders and cannot be deleted. Deactivate it instead.",
          }),
        ),
      );
    }

    yield* $(
      query(async (db) => {
        await db
          .delete(Tables.user)
          .where(
            and(
              eq(Tables.user.id, input.userId),
              inArray(Tables.user.role, [...STAFF_ROLES]),
            ),
          );
      }),
    );

    return { success: true } as const;
  });
