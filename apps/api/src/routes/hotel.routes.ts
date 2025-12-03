import { Router } from 'express';
import { createHotel, getHotel, getHotels, getMyHotels } from '../controllers/hotel.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes (if any) or protected?
// Creating a hotel might be public (onboarding) or super admin only?
// For now, let's say creating a hotel is public (signup), but verifying is Super Admin.
// Getting hotels is Super Admin.
// Getting single hotel is Hotel Admin or Super Admin.

router.post('/', requireAuth, requireRole(['ADMIN', 'BRAND_ADMIN']), createHotel); // Protected onboarding
router.get('/my-hotels', requireAuth, getMyHotels);
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), getHotels);
router.get('/:id', requireAuth, requireRole(['SUPER_ADMIN', 'HOTEL_ADMIN']), getHotel);

export default router;
