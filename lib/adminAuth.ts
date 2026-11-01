export function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  return allowedEmails.includes(normalizedEmail);
}