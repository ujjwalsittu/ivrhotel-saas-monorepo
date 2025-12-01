import { Router } from 'express';
import {
    updateOnboardingData,
    uploadDocument,
    submitOnboarding,
    getOnboardingStatus,
    verifyDocument,
    approveHotel,
    getPendingHotels
} from '../controllers/onboarding.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../services/upload.service';

import { requireHotel } from '../middleware/tenant';

const router = Router({ mergeParams: true });

// Hotel Admin routes
router.put('/:hotelId/onboarding', requireAuth, requireHotel('hotelId', 'hotel_admin'), updateOnboardingData);
router.post('/:hotelId/onboarding/upload', requireAuth, requireHotel('hotelId', 'hotel_admin'), upload.single('file'), uploadDocument);
router.post('/:hotelId/onboarding/submit', requireAuth, requireHotel('hotelId', 'hotel_admin'), submitOnboarding);
router.get('/:hotelId/onboarding/status', requireAuth, requireHotel('hotelId', 'hotel_admin'), getOnboardingStatus);

// Super Admin routes
router.get('/pending-verification', requireAuth, requireRole(['SUPER_ADMIN']), getPendingHotels);
router.put('/:hotelId/onboarding/verify/:documentType', requireAuth, requireRole(['SUPER_ADMIN']), verifyDocument);
router.post('/:hotelId/onboarding/approve', requireAuth, requireRole(['SUPER_ADMIN']), approveHotel);

export default router;
