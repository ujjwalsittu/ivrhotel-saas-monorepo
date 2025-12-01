import { Router } from 'express';
import { createStaff, getStaff, updateStaff, deleteStaff } from '../controllers/staff.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Staff Management
// Only HOTEL_ADMIN and MANAGER can manage staff.
// FRONT_DESK might need to see staff list? Maybe not. Let's restrict to ADMIN/MANAGER.

router.post('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createStaff);
router.get('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getStaff);
router.put('/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateStaff);
router.delete('/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteStaff);

export default router;
