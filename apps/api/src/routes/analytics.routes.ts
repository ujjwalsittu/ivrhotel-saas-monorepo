import { Router } from 'express';
import { getAnalytics, getOccupancy } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/dashboard', requireAuth, getAnalytics);
router.get('/occupancy', requireAuth, getOccupancy);

export default router;
