import { Router } from 'express';
import { createBooking, getBookings, checkIn, checkOut, updateBooking, deleteBooking, cancelBooking, getBookingActivities, generateKYCLink, autoAllocateRoom } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth';

import { requireHotel } from '../middleware/tenant';

const router = Router({ mergeParams: true });

// Booking Management
// FRONT_DESK is the primary user here.
// HOTEL_ADMIN and MANAGER can also access.

router.use(requireAuth);
router.use(requireHotel());

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/:id/check-in', checkIn);
router.post('/:id/check-out', checkOut);
router.post('/:id/kyc-link', generateKYCLink);
router.post('/:id/allocate-room', autoAllocateRoom);
router.get('/:id/activities', getBookingActivities);

export default router;
