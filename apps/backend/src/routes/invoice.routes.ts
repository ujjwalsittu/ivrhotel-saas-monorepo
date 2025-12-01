import { Router } from 'express';
import {
    generateInvoice,
    getInvoices,
    getInvoiceById,
    recordPayment
} from '../controllers/invoice.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/generate', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), generateInvoice);
router.get('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getInvoices);
router.get('/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getInvoiceById);
router.post('/:id/pay', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), recordPayment);

export default router;
