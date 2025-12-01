import { Router } from 'express';
import { createPlan, getPlans, updatePlan, deletePlan } from '../controllers/plan.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), createPlan);
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), getPlans);
router.put('/:id', requireAuth, requireRole(['SUPER_ADMIN']), updatePlan);
router.delete('/:id', requireAuth, requireRole(['SUPER_ADMIN']), deletePlan);

export default router;
