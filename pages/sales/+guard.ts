import { redirect } from "vike/abort";

export async function guard(pageContext: Vike.PageContext) {
  const session = pageContext.clientSession;

  if (!session) {
    throw redirect("/login");
  }

  // Sales flow is available to sales staff and to admins/accountants.
  // Regular customers have no access.
  if (
    session.role !== "sales" &&
    session.role !== "admin" &&
    session.role !== "accountant"
  ) {
    throw redirect("/");
  }
}
