import { Router } from 'express';
import { getHotelStats } from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/stats', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getHotelStats);

export default router;
