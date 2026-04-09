export type HubRole = "admin" | "manager" | "user";

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export function getAdminEmails() {
  const multiValue = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email));

  if (multiValue?.length) {
    return Array.from(new Set(multiValue));
  }

  return [normalizeEmail(process.env.ADMIN_EMAIL) ?? "josecancel2@gmail.com"];
}

export function getAdminEmail() {
  return getAdminEmails()[0];
}

export function isAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail ? getAdminEmails().includes(normalizedEmail) : false;
}
