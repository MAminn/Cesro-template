import { t } from "#root/shared/trpc/server";
import { createOrderProcedure } from "./create-order/trpc";
import { deleteOrderProcedure } from "./delete-order/trpc";
import { orderStatsProcedure } from "./order-stats/trpc";
import { updateOrderStatusProcedure } from "./update-order-status/trpc";
import { updateOrderProcedure } from "./update-order/trpc";
import { viewOrdersProcedure } from "./view-orders/trpc";

export const orderRouter = t.router({
  view: viewOrdersProcedure,
  create: createOrderProcedure,
  updateStatus: updateOrderStatusProcedure,
  updateOrder: updateOrderProcedure,
  stats: orderStatsProcedure,
  delete: deleteOrderProcedure,
});
