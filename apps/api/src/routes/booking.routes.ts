import { Router } from 'express';
import { createBooking, getBookings, checkIn, checkOut, updateBooking, deleteBooking } from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Booking Management
// FRONT_DESK is the primary user here.
// HOTEL_ADMIN and MANAGER can also access.

router.post('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), createBooking);
router.get('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getBookings);
router.put('/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), updateBooking);
router.delete('/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteBooking); // Only Manager/Admin can delete?
router.post('/:id/check-in', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), checkIn);
router.post('/:id/check-out', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), checkOut);

export default router;
