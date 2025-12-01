import { Router } from 'express';
import {
    createPaymentOrder,
    capturePayment,
    processRefund,
    addCharge,
    getFolio,
    handleWebhook
} from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Payment routes (requires auth)
router.post('/bookings/:bookingId/create-order', requireAuth, createPaymentOrder);
router.post('/bookings/:bookingId/capture', requireAuth, capturePayment);
router.post('/bookings/:bookingId/refund', requireAuth, processRefund);

// Folio routes
router.post('/bookings/:bookingId/charges', requireAuth, addCharge);
router.get('/bookings/:bookingId/folio', requireAuth, getFolio);

// Webhook (public - verified via signature)
router.post('/webhooks/razorpay', handleWebhook);

export default router;
