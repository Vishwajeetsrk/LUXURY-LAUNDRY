"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.panelAccess = panelAccess;
exports.adminOnly = adminOnly;
exports.requirePermission = requirePermission;
exports.requireRoles = requireRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const permissions_1 = require("../lib/permissions");
const JWT_SECRET = process.env.JWT_SECRET || "luxwash-secret-key-2024";
function authenticate(req, res, next) {
    let token = req.cookies?.token;
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        token = header.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
/** Staff panel access (SUPER_ADMIN, ADMIN, STAFF, DELIVERY) */
function panelAccess(req, res, next) {
    if (!req.user || !(0, permissions_1.isPanelRole)(req.user.role)) {
        res.status(403).json({ message: "Staff panel access required" });
        return;
    }
    next();
}
/** Full admin only — backward compatible */
function adminOnly(req, res, next) {
    if (!req.user || !(0, permissions_1.hasPermission)(req.user.role, "settings:write")) {
        res.status(403).json({ message: "Admin access required" });
        return;
    }
    next();
}
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user || !(0, permissions_1.hasPermission)(req.user.role, permission)) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        next();
    };
}
function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user || (!roles.includes(req.user.role) && req.user.role !== "SUPER_ADMIN")) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map