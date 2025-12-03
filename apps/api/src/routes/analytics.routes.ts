import { Router } from 'express';
import {
    getAnalytics,
    getOccupancy,
    getPricingRules,
    createPricingRule,
    deletePricingRule
} from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/dashboard', requireAuth, getAnalytics);
router.get('/occupancy', requireAuth, getOccupancy);

// Pricing Rules
router.get('/pricing-rules', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getPricingRules);
router.post('/pricing-rules', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createPricingRule);
router.delete('/pricing-rules/:ruleId', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deletePricingRule);

export default router;
