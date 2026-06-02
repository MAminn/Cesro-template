import { query } from "#root/shared/database/drizzle/db";
import { order, orderItem, user } from "#root/shared/database/drizzle/schema";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";

export const viewOrdersSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
});

export const viewOrders = (
  input: z.infer<typeof viewOrdersSchema>,
  session?: ClientSession,
) =>
  Effect.gen(function* ($) {
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            message: "You must be logged in to view orders",
            statusCode: 401,
            clientMessage: "You must be logged in to view orders",
          }),
        ),
      );
    }

    // Admin can view all orders, users can view their own orders
    // No special authentication needed beyond session check

    const { limit, offset, status } = input;
    const isStaff = session.role === "admin" || session.role === "accountant";

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          const conditions: SQL<unknown>[] = [];

          if (status) {
            conditions.push(eq(order.status, status));
          }

          // Staff (admin / accountant) see all orders. Everyone else
          // (sales, customers) only sees the orders they created.
          if (!isStaff) {
            const userResult = await tx
              .select({ id: user.id })
              .from(user)
              .where(eq(user.email, session.email))
              .execute();

            if (userResult.length === 0 || !userResult[0]?.id) {
              return [];
            }

            conditions.push(eq(order.userId, userResult[0].id));
          }

          const orders = await tx
            .select({
              id: order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              shippingAddress: order.shippingAddress,
              shippingCity: order.shippingCity,
              shippingState: order.shippingState,
              shippingPostalCode: order.shippingPostalCode,
              shippingCountry: order.shippingCountry,
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              discount: order.discount,
              promoCodeId: order.promoCodeId,
              total: order.total,
              status: order.status,
              notes: order.notes,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              daftraSyncStatus: order.daftraSyncStatus,
            })
            .from(order)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(order.createdAt))
            .limit(limit)
            .offset(offset)
            .execute();

          const ordersWithItems = await Promise.all(
            orders.map(async (orderData) => {
              // Single-shop mode: No vendor data needed
              const items = await tx
                .select({
                  id: orderItem.id,
                  productId: orderItem.productId,
                  vendorId: orderItem.vendorId, // Keep for DB schema compatibility
                  quantity: orderItem.quantity,
                  price: orderItem.price,
                  discountPrice: orderItem.discountPrice,
                  name: orderItem.name,
                })
                .from(orderItem)
                .where(eq(orderItem.orderId, orderData.id))
                .execute();

              return {
                ...orderData,
                items,
              };
            }),
          );

          return ordersWithItems;
        });
      }),
    );
  });
