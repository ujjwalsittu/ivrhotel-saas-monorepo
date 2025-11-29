import { Router } from 'express';
import { createStaff, getStaff, updateStaff, deleteStaff } from '../controllers/staff.controller';

const router = Router({ mergeParams: true });

router.post('/', createStaff);
router.get('/', getStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
