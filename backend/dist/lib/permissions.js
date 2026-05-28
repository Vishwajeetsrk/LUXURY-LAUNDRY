"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = exports.PANEL_ROLES = void 0;
exports.isPanelRole = isPanelRole;
exports.hasPermission = hasPermission;
exports.canAssignRole = canAssignRole;
exports.isFullAdmin = isFullAdmin;
exports.PANEL_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF", "DELIVERY"];
exports.PERMISSIONS = [
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
];
const ALL = [...exports.PERMISSIONS];
const ROLE_PERMISSIONS = {
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
function isPanelRole(role) {
    return !!role && exports.PANEL_ROLES.includes(role);
}
function hasPermission(role, permission) {
    if (!role)
        return false;
    if (role === "SUPER_ADMIN")
        return true;
    if (!isPanelRole(role))
        return false;
    return ROLE_PERMISSIONS[role].includes(permission);
}
function canAssignRole(actorRole, targetRole) {
    if (actorRole === "SUPER_ADMIN")
        return true;
    if (actorRole === "ADMIN") {
        return !["SUPER_ADMIN"].includes(targetRole);
    }
    return false;
}
/** Legacy alias — full admin write access */
function isFullAdmin(role) {
    return role === "ADMIN" || role === "SUPER_ADMIN";
}
//# sourceMappingURL=permissions.js.map