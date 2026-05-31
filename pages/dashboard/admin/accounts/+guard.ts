import { redirect } from "vike/abort";

export async function guard(pageContext: Vike.PageContext) {
  if (!pageContext.clientSession) {
    throw redirect("/login");
  }

  // Account management is restricted to admins only.
  if (pageContext.clientSession.role !== "admin") {
    throw redirect("/dashboard");
  }
}
