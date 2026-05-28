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

export const ADMIN_ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/admin": "dashboard:read",
  "/admin/orders": "orders:read",
  "/admin/invoices": "invoices:read",
  "/admin/subscriptions": "subscriptions:read",
  "/admin/customers": "customers:read",
  "/admin/services": "services:read",
  "/admin/shop": "shop:read",
  "/admin/whatsapp": "whatsapp:read",
  "/admin/content": "content:write",
  "/admin/contacts": "contacts:read",
  "/admin/settings": "settings:write",
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  STAFF: "Staff",
  DELIVERY: "Delivery",
  CUSTOMER: "Customer",
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

export function canAccessAdminPath(role: string, pathname: string): boolean {
  const entry = Object.entries(ADMIN_ROUTE_PERMISSIONS).find(([path]) =>
    pathname === path || (path !== "/admin" && pathname.startsWith(path))
  );
  if (!entry) return hasPermission(role, "dashboard:read");
  return hasPermission(role, entry[1]);
}

export function assignableRoles(actorRole: string): string[] {
  if (actorRole === "SUPER_ADMIN") {
    return ["CUSTOMER", "STAFF", "DELIVERY", "ADMIN", "SUPER_ADMIN"];
  }
  if (actorRole === "ADMIN") {
    return ["CUSTOMER", "STAFF", "DELIVERY", "ADMIN"];
  }
  return [];
}

export function isFullAdmin(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
