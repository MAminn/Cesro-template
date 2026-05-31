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
import { getStoreOwnerId } from "#root/shared/config/store";

// Statuses where stock has already been deducted. Editing item quantities on
// such an order must adjust stock by the net delta.
const DEDUCTED_STATUSES = new Set(["processing", "shipped", "delivered"]);

const EditOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  // Optional admin overrides; fall back to the product's current pricing.
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  name: z.string().min(1).optional(),
  selectedOptions: z.string().optional(),
});

export const updateOrderSchema = z.object({
  orderId: z.string().uuid(),
  // Shop / client details
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().min(1).optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(1).optional(),
  shippingCity: z.string().min(1).optional(),
  shippingState: z.string().optional().nullable(),
  shippingPostalCode: z.string().optional().nullable(),
  shippingCountry: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Monetary overrides (server recalculates the total — never trust the client)
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  // Replacement set of line items (full replace when provided)
  items: z.array(EditOrderItemSchema).min(1).optional(),
});

export const updateOrder = (
  input: z.infer<typeof updateOrderSchema>,
  session?: ClientSession,
) =>
  Effect.gen(function* ($) {
    if (!session) {
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "Unauthorized",
            message: "You must be logged in to edit an order",
            statusCode: 401,
            clientMessage: "You must be logged in to edit an order",
          }),
        ),
      );
    }

    if (session.role !== "admin") {
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
          // ─── Load the current order ──────────────────────────────────────
          const currentRows = await tx
            .select()
            .from(order)
            .where(eq(order.id, input.orderId))
            .execute();

          const current = currentRows[0];
          if (!current) {
            throw new ServerError({
              tag: "OrderNotFound",
              message: `Order ${input.orderId} not found`,
              statusCode: 404,
              clientMessage: "Order not found",
            });
          }

          const stockAlreadyDeducted = DEDUCTED_STATUSES.has(current.status);

          // ─── Recalculate items + subtotal (if items provided) ────────────
          let subtotal = Number.parseFloat(current.subtotal);

          if (input.items) {
            const productIds = input.items.map((i) => i.productId);
            const products = await tx
              .select({
                id: product.id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                stock: product.stock,
              })
              .from(product)
              .where(inArray(product.id, productIds))
              .execute();

            // Validate all referenced products exist.
            for (const item of input.items) {
              if (!products.find((p) => p.id === item.productId)) {
                throw new ServerError({
                  tag: "ProductNotFound",
                  message: `Product ${item.productId} not found`,
                  statusCode: 404,
                  clientMessage:
                    "One of the products in this order could not be found.",
                });
              }
            }

            // ─── Stock net-adjustment for already-accepted orders ──────────
            if (stockAlreadyDeducted) {
              const existingItems = await tx
                .select({
                  productId: orderItem.productId,
                  quantity: orderItem.quantity,
                })
                .from(orderItem)
                .where(eq(orderItem.orderId, input.orderId))
                .execute();

              const oldQty = new Map<string, number>();
              for (const it of existingItems) {
                oldQty.set(
                  it.productId,
                  (oldQty.get(it.productId) ?? 0) + it.quantity,
                );
              }

              const newQty = new Map<string, number>();
              for (const it of input.items) {
                newQty.set(
                  it.productId,
                  (newQty.get(it.productId) ?? 0) + it.quantity,
                );
              }

              const allProductIds = new Set<string>([
                ...oldQty.keys(),
                ...newQty.keys(),
              ]);

              // Validate availability for any net increase before applying.
              for (const pid of allProductIds) {
                const delta = (newQty.get(pid) ?? 0) - (oldQty.get(pid) ?? 0);
                if (delta <= 0) continue;
                const productData = products.find((p) => p.id === pid);
                const available = productData
                  ? productData.stock
                  : // Product removed from new set won't reach here (delta<=0),
                    // so this branch means product exists in products list.
                    0;
                if (available < delta) {
                  throw new ServerError({
                    tag: "InsufficientStock",
                    message: `Insufficient stock for ${productData?.name ?? pid}: need ${delta} more, have ${available}`,
                    statusCode: 400,
                    clientMessage: `Not enough stock for "${productData?.name ?? "a product"}" to apply this edit (need ${delta} more, available ${available}).`,
                  });
                }
              }

              // Apply net stock adjustments.
              for (const pid of allProductIds) {
                const delta = (newQty.get(pid) ?? 0) - (oldQty.get(pid) ?? 0);
                if (delta === 0) continue;
                const productData = products.find((p) => p.id === pid);
                if (!productData) continue;
                await tx
                  .update(product)
                  .set({ stock: productData.stock - delta })
                  .where(eq(product.id, pid));
              }
            }

            // Replace line items.
            await tx
              .delete(orderItem)
              .where(eq(orderItem.orderId, input.orderId));

            subtotal = 0;
            for (const item of input.items) {
              const productData = products.find((p) => p.id === item.productId);
              if (!productData) continue;

              const basePrice =
                item.price ?? Number.parseFloat(productData.price);
              const effectiveDiscount =
                item.discountPrice !== undefined
                  ? item.discountPrice
                  : productData.discountPrice
                    ? Number.parseFloat(productData.discountPrice)
                    : null;

              const unitPrice =
                effectiveDiscount != null ? effectiveDiscount : basePrice;
              subtotal += unitPrice * item.quantity;

              const itemName =
                item.name ??
                (item.selectedOptions
                  ? `${productData.name} (${item.selectedOptions})`
                  : productData.name);

              await tx.insert(orderItem).values({
                orderId: input.orderId,
                productId: item.productId,
                vendorId: getStoreOwnerId(),
                quantity: item.quantity,
                price: basePrice.toString(),
                discountPrice:
                  effectiveDiscount != null
                    ? effectiveDiscount.toString()
                    : null,
                name: itemName,
                vendorName: null,
              });
            }
          }

          // ─── Recalculate monetary totals server-side ─────────────────────
          const shipping =
            input.shipping !== undefined
              ? input.shipping
              : Number.parseFloat(current.shipping);
          const discount =
            input.discount !== undefined
              ? input.discount
              : current.discount
                ? Number.parseFloat(current.discount)
                : 0;

          const discountedSubtotal = Math.max(0, subtotal - discount);
          const total = discountedSubtotal + shipping;

          // ─── Build the order update payload ──────────────────────────────
          const updateData: Record<string, unknown> = {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount > 0 ? discount.toFixed(2) : null,
            total: total.toFixed(2),
            updatedAt: new Date(),
          };

          if (input.customerName !== undefined)
            updateData.customerName = input.customerName;
          if (input.customerPhone !== undefined)
            updateData.customerPhone = input.customerPhone;
          if (input.customerEmail !== undefined)
            updateData.customerEmail = input.customerEmail || "";
          if (input.shippingAddress !== undefined)
            updateData.shippingAddress = input.shippingAddress;
          if (input.shippingCity !== undefined)
            updateData.shippingCity = input.shippingCity;
          if (input.shippingState !== undefined)
            updateData.shippingState = input.shippingState ?? "";
          if (input.shippingPostalCode !== undefined)
            updateData.shippingPostalCode = input.shippingPostalCode ?? "";
          if (input.shippingCountry !== undefined)
            updateData.shippingCountry = input.shippingCountry ?? "";
          if (input.notes !== undefined) updateData.notes = input.notes;

          const updated = await tx
            .update(order)
            .set(updateData)
            .where(eq(order.id, input.orderId))
            .returning();

          if (!updated[0]) {
            throw new ServerError({
              tag: "UpdateFailed",
              message: "Failed to update order",
              statusCode: 500,
              clientMessage: "Failed to update the order. Please try again.",
            });
          }

          // ─── Audit log ───────────────────────────────────────────────────
          const userData = await tx
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, session.email))
            .execute();

          await tx.insert(orderLog).values({
            orderId: input.orderId,
            userId: userData[0]?.id,
            action: "status_changed",
            oldStatus: current.status,
            newStatus: current.status,
            note: `Order edited by ${session.role}. New subtotal ${subtotal.toFixed(
              2,
            )}, shipping ${shipping.toFixed(2)}, discount ${discount.toFixed(
              2,
            )}, total ${total.toFixed(2)}.`,
          });

          // Return the updated order together with its (new) items.
          const items = await tx
            .select()
            .from(orderItem)
            .where(eq(orderItem.orderId, input.orderId))
            .execute();

          return { ...updated[0], items };
        });
      }),
    );
  });
