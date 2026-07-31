export const PANEL_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF", "DELIVERY"] as const;
export type PanelRole = (typeof PANEL_ROLES)[number];

export const PERMISSIONS = [
  "dashboard:read",
  "orders:read",
  "orders:write",
  "orders:update-status",
  "orders:delete",
  "invoices:read",
  "invoices:write",
  "subscriptions:read",
  "subscriptions:write",
  "customers:read",
  "customers:write",
  "customers:delete",
  "services:read",
  "services:write",
  "shop:read",
  "shop:write",
  "contacts:read",
  "contacts:write",
  "content:read",
  "content:write",
  "settings:read",
  "settings:write",
  "whatsapp:read",
  "reviews:read",
  "reviews:write",
  "users:assign-super-admin",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

const ROLE_PERMISSIONS: Record<PanelRole, Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL.filter((p) => p !== "users:assign-super-admin"),
  STAFF: [
    "dashboard:read",
    "orders:read",
    "orders:write",
    "invoices:read",
    "subscriptions:read",
    "customers:read",
    "services:read",
    "shop:read",
    "contacts:read",
    "contacts:write",
    "whatsapp:read",
  ],
  DELIVERY: ["dashboard:read", "orders:read", "orders:update-status"],
};

export function isPanelRole(role: string | undefined | null): role is PanelRole {
  return !!role && PANEL_ROLES.includes(role as PanelRole);
}

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  if (!isPanelRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAssignRole(actorRole: string, targetRole: string): boolean {
  if (actorRole === "SUPER_ADMIN") return true;
  if (actorRole === "ADMIN") {
    return !["SUPER_ADMIN"].includes(targetRole);
  }
  return false;
}

/** Legacy alias — full admin write access */
export function isFullAdmin(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
