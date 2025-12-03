import { Router } from 'express';
import { findBooking, checkIn, checkOut } from '../controllers/kiosk.controller';

const router = Router();

// Kiosk routes - typically these would be secured by a specific Kiosk API Key or similar
// For MVP, we'll leave them open or assume basic auth
router.post('/find-booking', findBooking);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

export default router;
