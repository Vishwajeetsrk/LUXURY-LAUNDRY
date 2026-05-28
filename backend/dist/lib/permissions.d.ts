export declare const PANEL_ROLES: readonly ["SUPER_ADMIN", "ADMIN", "STAFF", "DELIVERY"];
export type PanelRole = (typeof PANEL_ROLES)[number];
export declare const PERMISSIONS: readonly ["dashboard:read", "orders:read", "orders:write", "orders:update-status", "orders:delete", "invoices:read", "invoices:write", "subscriptions:read", "subscriptions:write", "customers:read", "customers:write", "customers:delete", "services:read", "services:write", "shop:read", "shop:write", "contacts:read", "contacts:write", "content:read", "content:write", "settings:read", "settings:write", "whatsapp:read", "users:assign-super-admin"];
export type Permission = (typeof PERMISSIONS)[number];
export declare function isPanelRole(role: string | undefined | null): role is PanelRole;
export declare function hasPermission(role: string | undefined | null, permission: Permission): boolean;
export declare function canAssignRole(actorRole: string, targetRole: string): boolean;
/** Legacy alias — full admin write access */
export declare function isFullAdmin(role: string | undefined | null): boolean;
//# sourceMappingURL=permissions.d.ts.map