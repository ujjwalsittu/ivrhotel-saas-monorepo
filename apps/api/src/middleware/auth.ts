import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any
        });

        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        (req as any).user = session.user;
        (req as any).session = session.session;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Super Admin has access to everything? Or should we be explicit?
            // Let's assume SUPER_ADMIN is always allowed if we include it in allowedRoles or handle it here.
            // For now, let's just check if user.role is in allowedRoles.
            // Note: user.role might need to be added to the session/user object in better-auth config if it's not there by default.
            // We need to check if our auth config includes role in the session.

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            next();
        } catch (error) {
            console.error("Role Middleware Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
};
