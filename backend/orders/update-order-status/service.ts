import { query } from "#root/shared/database/drizzle/db";
import {
  order,
  orderItem,
  orderLog,
  product,
  user,
} from "#root/shared/database/drizzle/schema";
import { Effect } from "effect";
import { z } from "zod";
import type { ClientSession } from "#root/backend/auth/shared/entities";
import { ServerError } from "#root/shared/error/server";
import { eq, inArray } from "drizzle-orm";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

// Statuses that imply stock has already been deducted (i.e. the order is being
// fulfilled). Stock is deducted exactly once, when an order leaves "pending".
const DEDUCTED_STATUSES = new Set(["processing", "shipped", "delivered"]);

export const updateOrderStatus = (
  input: z.infer<typeof updateOrderStatusSchema>,
  session?: ClientSession,
) =>
  Effect.gen(function* ($) {
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            message: "You must be logged in to update order status",
            statusCode: 401,
            clientMessage: "You must be logged in to update order status",
          }),
        ),
      );
    }

    const { orderId, status } = input;
    const isAdmin = session.role === "admin";

    // Only admins can update orders
    if (!isAdmin) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Forbidden",
            message: "Admin access required",
            statusCode: 403,
            clientMessage: "Admin access required",
          }),
        ),
      );
    }

    return yield* $(
      query(async (db) => {
        return await db.transaction(async (tx) => {
          // Get current order data including old status
          const currentOrder = await tx
            .select({ id: order.id, status: order.status })
            .from(order)
            .where(eq(order.id, orderId))
            .execute();

          if (!currentOrder || currentOrder.length === 0) {
            throw new ServerError({
              tag: "OrderNotFound",
              message: `Order with ID ${orderId} not found`,
              statusCode: 404,
              clientMessage: "Order not found",
            });
          }

          const oldStatus = currentOrder[0]?.status || "pending";

          // ─── Stock handling on approval ──────────────────────────────────
          // Deduct stock only when an order transitions OUT of "pending" into a
          // fulfilling status (Accepted / Shipped / Delivered). This guarantees
          // stock is deducted exactly once and never at order creation.
          let stockNote = "";
          const isApproval =
            oldStatus === "pending" && DEDUCTED_STATUSES.has(status);

          if (isApproval) {
            const items = await tx
              .select({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                name: orderItem.name,
              })
              .from(orderItem)
              .where(eq(orderItem.orderId, orderId))
              .execute();

            if (items.length > 0) {
              const productIds = items.map((i) => i.productId);
              const products = await tx
                .select({
                  id: product.id,
                  name: product.name,
                  stock: product.stock,
                })
                .from(product)
                .where(inArray(product.id, productIds))
                .execute();

              // Aggregate required quantity per product (an order may contain
              // the same product across multiple line items / variants).
              const required = new Map<string, number>();
              for (const item of items) {
                required.set(
                  item.productId,
                  (required.get(item.productId) ?? 0) + item.quantity,
                );
              }

              // Validate stock for every product before deducting anything.
              for (const [productId, qty] of required) {
                const productData = products.find((p) => p.id === productId);
                if (!productData) {
                  throw new ServerError({
                    tag: "ProductNotFound",
                    message: `Product ${productId} not found while approving order`,
                    statusCode: 404,
                    clientMessage:
                      "A product in this order no longer exists and cannot be approved.",
                  });
                }
                if (productData.stock < qty) {
                  throw new ServerError({
                    tag: "InsufficientStock",
                    message: `Insufficient stock for ${productData.name}: have ${productData.stock}, need ${qty}`,
                    statusCode: 400,
                    clientMessage: `Cannot accept order: not enough stock for "${productData.name}" (available ${productData.stock}, required ${qty}).`,
                  });
                }
              }

              // All good — deduct stock.
              for (const [productId, qty] of required) {
                const productData = products.find((p) => p.id === productId);
                if (!productData) continue;
                await tx
                  .update(product)
                  .set({ stock: productData.stock - qty })
                  .where(eq(product.id, productId));
              }
              stockNote = " Stock deducted on approval.";
            }
          } else if (
            DEDUCTED_STATUSES.has(oldStatus) &&
            status === "cancelled"
          ) {
            // Cancelling an already-accepted order. Stock was already deducted.
            // We intentionally do NOT auto-restock here to avoid double-counting
            // in case items were already picked/shipped. Restocking should be a
            // deliberate, separate admin action.
            // TODO: add an explicit "restock on cancel" action if required.
            stockNote =
              " NOTE: order was already accepted; stock was NOT automatically restored.";
          }

          const updateResult = await tx
            .update(order)
            .set({ status, updatedAt: new Date() })
            .where(eq(order.id, orderId))
            .returning();

          if (!updateResult || updateResult.length === 0) {
            throw new ServerError({
              tag: "UpdateFailed",
              message: "Failed to update order status",
              statusCode: 500,
              clientMessage: "Failed to update order status. Please try again.",
            });
          }

          // Get user ID for logging
          const userData = await tx
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, session.email))
            .execute();

          // Log the order status change
          await tx.insert(orderLog).values({
            orderId,
            userId: userData[0]?.id,
            action: status === "cancelled" ? "cancelled" : "status_changed",
            oldStatus,
            newStatus: status,
            note: `Status changed from ${oldStatus} to ${status} by ${session.role}.${stockNote}`,
          });

          return updateResult[0];
        });
      }),
    );
  });
