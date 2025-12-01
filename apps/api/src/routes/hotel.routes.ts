import { Router } from 'express';
import { createHotel, getHotel, getHotels, updateHotelDocuments, verifyHotel } from '../controllers/hotel.controller';
import { upload } from '../middleware/upload';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes (if any) or protected?
// Creating a hotel might be public (onboarding) or super admin only?
// For now, let's say creating a hotel is public (signup), but verifying is Super Admin.
// Getting hotels is Super Admin.
// Getting single hotel is Hotel Admin or Super Admin.

router.post('/', createHotel); // Public onboarding
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), getHotels);
router.get('/:id', requireAuth, requireRole(['SUPER_ADMIN', 'HOTEL_ADMIN']), getHotel);
router.post('/:id/documents', requireAuth, requireRole(['HOTEL_ADMIN', 'SUPER_ADMIN']), upload.array('documents', 5), updateHotelDocuments);
router.post('/:id/verify', requireAuth, requireRole(['SUPER_ADMIN']), verifyHotel);

export default router;
