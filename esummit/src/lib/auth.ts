const adminAllowlist = process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';

export const allowedAdmins = adminAllowlist
  .split(',')
  .map((item: string) => item.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAdmin(email?: string | null) {
  if (!email) return false;
  return allowedAdmins.includes(email.toLowerCase());
}
