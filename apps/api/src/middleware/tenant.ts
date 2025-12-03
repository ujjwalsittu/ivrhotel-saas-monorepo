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
import { Hotel } from '../models/Hotel';

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

            // Fetch the hotel to get the organizationId
            const hotel = await Hotel.findById(hotelId);
            if (!hotel) {
                return res.status(404).json({ message: 'Hotel not found' });
            }

            if (!hotel.organizationId) {
                // If hotel has no organization linked, maybe only super admin can access?
                // Or it's a data integrity issue.
                if (user.role !== 'super_admin') {
                    return res.status(403).json({ message: 'Forbidden: Hotel not linked to organization' });
                }
            }

            // Check if user is a member of the organization
            // listOrganizations does not return role. We need to check membership explicitly.
            // We can use listMembers for the organization and find the user.
            // Note: This might be inefficient for large orgs. Better-auth might have getMember.

            const response = await auth.api.listMembers({
                headers: req.headers as unknown as HeadersInit,
                query: {
                    organizationId: hotel.organizationId!
                }
            });

            const members = response.members;
            const membership = members.find(member => member.userId === user.id);

            // Allow Super Admin to bypass
            if (!membership && user.role !== 'super_admin') {
                return res.status(403).json({ message: 'Forbidden: No access to this hotel' });
            }

            // If a specific role is required, check it (unless super_admin)
            if (requiredRole && user.role !== 'super_admin') {
                const userOrgRole = membership?.role as string;
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
