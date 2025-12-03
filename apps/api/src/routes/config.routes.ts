import { Router } from 'express';
import * as configController from '../controllers/config.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public/Authenticated routes
router.get('/amenities', configController.getAmenities);
router.get('/property-types', configController.getPropertyTypes);

// Admin only routes
router.post('/amenities', requireAuth, requireRole(['SUPER_ADMIN']), configController.createAmenity);
router.post('/property-types', requireAuth, requireRole(['SUPER_ADMIN']), configController.createPropertyType);

export default router;
