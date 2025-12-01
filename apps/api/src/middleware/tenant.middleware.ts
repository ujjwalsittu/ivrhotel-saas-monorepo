import { Request, Response, NextFunction } from 'express';
import { Hotel } from '../models/Hotel';
import { Brand } from '../models/Brand';

export interface TenantContext {
    type: 'platform' | 'brand' | 'hotel';
    tenantId: string;
    hotelId?: string;
    brandId?: string;
    hotel?: any;
    brand?: any;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            tenant?: TenantContext;
        }
    }
}

/**
 * Tenant resolution middleware
 * Extracts tenant context from request and resolves hierarchy
 */
export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
    try {
        // Skip tenant resolution for auth routes
        if (req.path.startsWith('/api/auth')) {
            return next();
        }

        // Extract tenant info from headers or route params
        const hotelId = req.params.hotelId || req.headers['x-hotel-id'] as string;
        const brandId = req.params.brandId || req.headers['x-brand-id'] as string;

        // Determine tenant type and resolve context
        if (hotelId) {
            // Hotel-level tenant
            const hotel = await Hotel.findById(hotelId).populate('brandId');
            if (!hotel) {
                return res.status(404).json({ message: 'Hotel not found' });
            }

            req.tenant = {
                type: 'hotel',
                tenantId: hotelId,
                hotelId: hotelId,
                brandId: hotel.brandId?.toString(),
                hotel: hotel,
                brand: hotel.brandId
            };
        } else if (brandId) {
            // Brand-level tenant
            const brand = await Brand.findById(brandId);
            if (!brand) {
                return res.status(404).json({ message: 'Brand not found' });
            }

            req.tenant = {
                type: 'brand',
                tenantId: brandId,
                brandId: brandId,
                brand: brand
            };
        } else {
            // Platform-level (Super Admin)
            req.tenant = {
                type: 'platform',
                tenantId: 'platform'
            };
        }

        next();
    } catch (error) {
        console.error('Tenant resolution error:', error);
        res.status(500).json({ message: 'Error resolving tenant context' });
    }
}

/**
 * Middleware to ensure hotel-level tenant context exists
 */
export function requireHotelContext(req: Request, res: Response, next: NextFunction) {
    if (!req.tenant || req.tenant.type !== 'hotel') {
        return res.status(400).json({ message: 'Hotel context required' });
    }
    next();
}

/**
 * Middleware to ensure brand or hotel-level tenant context
 */
export function requireBrandOrHotelContext(req: Request, res: Response, next: NextFunction) {
    if (!req.tenant || (req.tenant.type !== 'brand' && req.tenant.type !== 'hotel')) {
        return res.status(400).json({ message: 'Brand or hotel context required' });
    }
    next();
}

/**
 * Helper to get tenant filter for MongoDB queries
 */
export function getTenantFilter(tenant: TenantContext) {
    if (tenant.type === 'hotel') {
        return { hotelId: tenant.hotelId };
    } else if (tenant.type === 'brand') {
        return { brandId: tenant.brandId };
    }
    // Platform level - no filter (access all)
    return {};
}
