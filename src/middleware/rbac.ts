const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 100,
  SUPERVISOR: 50,
  USER: 10,
};

export function checkPermission(user: { role: string }, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function hasRole(user: { role: string }, role: string): boolean {
  return user.role === role;
}

export function isAdmin(user: { role: string }): boolean {
  return user.role === "ADMIN";
}

export function isSupervisor(user: { role: string }): boolean {
  return user.role === "SUPERVISOR";
}
