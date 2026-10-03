export const OWNER_USERNAMES = ['076923', 'hwonda'];

export function resolveRole(username?: string, role?: string): string {
  if (username && OWNER_USERNAMES.includes(username)) return 'owner';
  return role || 'contributor';
}
