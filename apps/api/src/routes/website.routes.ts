import { Router } from 'express';
import {
    getPublicConfig,
    getWebsiteConfig,
    updateWebsiteConfig
} from '../controllers/website.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Public routes
router.get('/public/config/:identifier', getPublicConfig);

// Admin routes
router.get('/hotels/:hotelId/website', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getWebsiteConfig);
router.put('/hotels/:hotelId/website', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateWebsiteConfig);

export default router;
