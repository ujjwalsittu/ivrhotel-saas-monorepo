import { Router } from 'express';
import { createBooking, getBookings, checkIn, checkOut, updateBooking, deleteBooking, cancelBooking } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth';

import { requireHotel } from '../middleware/tenant';

const router = Router({ mergeParams: true });

// Booking Management
// FRONT_DESK is the primary user here.
// HOTEL_ADMIN and MANAGER can also access.

router.use(requireHotel());

router.post('/', requireAuth, createBooking);
router.get('/', requireAuth, getBookings);
router.put('/:id', requireAuth, updateBooking);
router.delete('/:id', requireAuth, deleteBooking);
router.post('/:id/cancel', requireAuth, cancelBooking);
router.post('/:id/check-in', requireAuth, checkIn);
router.post('/:id/check-out', requireAuth, checkOut);

export default router;
