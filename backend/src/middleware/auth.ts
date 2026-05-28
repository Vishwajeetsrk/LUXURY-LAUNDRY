import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { hasPermission, isPanelRole, type Permission } from "../lib/permissions";

const JWT_SECRET = process.env.JWT_SECRET || "luxwash-secret-key-2024";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Staff panel access (SUPER_ADMIN, ADMIN, STAFF, DELIVERY) */
export function panelAccess(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !isPanelRole(req.user.role)) {
    res.status(403).json({ message: "Staff panel access required" });
    return;
  }
  next();
}

/** Full admin only — backward compatible */
export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !hasPermission(req.user.role, "settings:write")) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

export function requirePermission(permission: Permission) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export function requireRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== "SUPER_ADMIN")) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
