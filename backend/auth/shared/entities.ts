export interface ClientSession {
  id: string;
  token: string;
  email: string;
  name: string;
  phone: string;
  expiresAt: Date;
  role: "admin" | "accountant" | "sales" | "user";
}
