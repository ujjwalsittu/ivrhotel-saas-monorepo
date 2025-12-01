import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';

/**
 * Middleware to ensure user is authenticated
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as unknown as HeadersInit
        });

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        (req as any).user = session.user;
        (req as any).session = session.session;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking authentication' });
    }
};

/**
 * Middleware to ensure user belongs to a specific hotel (Organization)
 * @param hotelIdParam - The parameter name for hotel ID
 * @param requiredRole - Optional role required within the hotel (e.g., 'hotel_admin', 'front_desk')
 */
export const requireHotel = (hotelIdParam = 'hotelId', requiredRole?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const hotelId = req.params[hotelIdParam] || req.body[hotelIdParam] || req.query[hotelIdParam];
            if (!hotelId) {
                return res.status(400).json({ message: 'Hotel ID is required' });
            }

            // Check if user is a member of the organization (hotel)
            const memberships = await auth.api.listOrganizations({
                headers: req.headers as unknown as HeadersInit
            });

            // Note: listOrganizations returns array of organizations, we need to check membership
            // Better approach: use getFullOrganization or check user's active organization

            // For now, let's assume we can verify membership via API or session
            // In better-auth, active organization is often stored in session or we query it

            const membership = memberships?.find(org => org.id === hotelId);

            // Allow Super Admin to bypass
            if (!membership && user.role !== 'super_admin') {
                return res.status(403).json({ message: 'Forbidden: No access to this hotel' });
            }

            // If a specific role is required, check it (unless super_admin)
            if (requiredRole && user.role !== 'super_admin') {
                // membership.role is the role in the organization
                // We need to check if the user's role in this org matches or has higher priority
                // For MVP, let's just check exact match or 'owner'/'admin'
                const userOrgRole = (membership as any)?.role;
                if (userOrgRole !== requiredRole && userOrgRole !== 'owner' && userOrgRole !== 'admin' && userOrgRole !== 'hotel_admin') {
                    return res.status(403).json({ message: `Forbidden: Requires ${requiredRole} role` });
                }
            }

            next();
        } catch (error) {
            console.error('Tenant middleware error:', error);
            res.status(500).json({ message: 'Error checking hotel access' });
        }
    };
};

/**
 * Middleware to ensure user belongs to a specific Brand
 */
export const requireBrand = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement Brand logic when Brand model is fully integrated
    next();
};
