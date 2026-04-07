export type HubRole = "admin" | "manager" | "user";

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export function getAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL) ?? "josecancel2@gmail.com";
}

export function isAdminEmail(email: string | null | undefined) {
  return normalizeEmail(email) === getAdminEmail();
}
