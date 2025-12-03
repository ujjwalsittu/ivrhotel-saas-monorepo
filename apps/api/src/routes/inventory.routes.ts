import { Router } from 'express';
import {
    createItem,
    getItems,
    updateItem,
    deleteItem,
    createTransaction,
    getTransactions
} from '../controllers/inventory.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Items
router.post('/items', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createItem);
router.get('/items', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getItems);
router.put('/items/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateItem);
router.delete('/items/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteItem);

// Transactions
router.post('/transactions', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'HOUSEKEEPING']), createTransaction);
router.get('/transactions', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getTransactions);

export default router;
