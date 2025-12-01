import { Router } from 'express';
import {
    createMenuItem,
    getMenuItems,
    updateMenuItem,
    deleteMenuItem,
    createOrder,
    getOrders,
    updateOrder
} from '../controllers/pos.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Menu Items
router.post('/menu-items', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createMenuItem);
router.get('/menu-items', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getMenuItems);
router.put('/menu-items/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateMenuItem);
router.delete('/menu-items/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteMenuItem);

// Orders
router.post('/orders', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), createOrder);
router.get('/orders', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getOrders);
router.put('/orders/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), updateOrder);

export default router;
