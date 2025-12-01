import { Router } from 'express';
import { createRoom, getRooms, updateRoom, deleteRoom, getRoomTypes, createRoomType, updateRoomType, deleteRoomType, getFloors, createFloor, updateFloor, deleteFloor, getAvailableRooms } from '../controllers/room.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// All room management requires at least HOTEL_ADMIN, MANAGER, or FRONT_DESK (read-only?)
// Let's allow FRONT_DESK to view rooms, but only ADMIN/MANAGER to manage.

// Floors
router.post('/floors', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createFloor);
router.get('/floors', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getFloors);
router.put('/floors/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateFloor);
router.delete('/floors/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteFloor);

// Room Types
router.post('/room-types', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createRoomType);
router.get('/room-types', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getRoomTypes);
router.put('/room-types/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), updateRoomType);
router.delete('/room-types/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteRoomType);

// Rooms
router.post('/rooms', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createRoom);
router.get('/available-rooms', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getAvailableRooms);
router.get('/rooms', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']), getRooms);
router.put('/rooms/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'HOUSEKEEPING']), updateRoom); // Housekeeping can update status
router.delete('/rooms/:id', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), deleteRoom);

export default router;
