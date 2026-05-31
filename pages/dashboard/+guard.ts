import { redirect } from "vike/abort";
import { isSingleShopMode } from "#root/shared/config/app";

export async function guard(pageContext: Vike.PageContext) {
  if (!pageContext.clientSession) {
    throw redirect("/login");
  }

  const role = pageContext.clientSession.role;

  // Sales staff have their own dedicated wholesale order flow.
  if (role === "sales") {
    throw redirect("/sales/orders/new");
  }

  // In single-shop mode, only admins and accountants can access the dashboard.
  if (isSingleShopMode() && role !== "admin" && role !== "accountant") {
    throw redirect("/");
  }

  // In multi-vendor mode, redirect users with 'user' role to the homepage
  if (!isSingleShopMode() && role === "user") {
    throw redirect("/");
  }
}
