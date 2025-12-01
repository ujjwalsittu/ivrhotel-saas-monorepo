import { Router } from 'express';
import {
    createTask,
    getTasks,
    updateTask,
    getRoomStatusStats
} from '../controllers/housekeeping.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/tasks', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'HOUSEKEEPING']), createTask);
router.get('/tasks', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getTasks);
router.put('/tasks/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'HOUSEKEEPING']), updateTask);
router.get('/stats', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getRoomStatusStats);

export default router;
