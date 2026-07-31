import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { getJwtSecret } from "../lib/jwt";
import { hasPermission, isPanelRole, type Permission } from "../lib/permissions";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
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
