import { Router } from 'express';
import { createBooking, getBookings, checkIn, checkOut } from '../controllers/booking.controller';

const router = Router({ mergeParams: true });

router.post('/', createBooking);
router.get('/', getBookings);
router.post('/:id/check-in', checkIn);
router.post('/:id/check-out', checkOut);

export default router;
