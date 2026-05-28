import { Request, Response, NextFunction } from "express";
import { type Permission } from "../lib/permissions";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
/** Staff panel access (SUPER_ADMIN, ADMIN, STAFF, DELIVERY) */
export declare function panelAccess(req: AuthRequest, res: Response, next: NextFunction): void;
/** Full admin only — backward compatible */
export declare function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function requirePermission(permission: Permission): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function requireRoles(roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map