import { Router } from 'express';
import {
    createRoom, getRooms, updateRoom, deleteRoom,
    getRoomTypes, createRoomType, updateRoomType, deleteRoomType,
    getFloors, createFloor, updateFloor, deleteFloor,
    getAvailableRooms,
    createFloorsBulk, createRoomsBulk
} from '../controllers/room.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { requireHotel } from '../middleware/tenant';

const router = Router({ mergeParams: true });

// Apply requireHotel to all routes
// We need to check if the user has access to the hotel specified in params
// Roles are checked by requireRole, but requireHotel checks organization membership

// Floors
router.post('/floors', requireAuth, requireHotel('hotelId', 'hotel_admin'), createFloor);
router.post('/floors/bulk', requireAuth, requireHotel('hotelId', 'hotel_admin'), createFloorsBulk);
router.get('/floors', requireAuth, requireHotel('hotelId'), getFloors);
router.put('/floors/:id', requireAuth, requireHotel('hotelId', 'hotel_admin'), updateFloor);
router.delete('/floors/:id', requireAuth, requireHotel('hotelId', 'hotel_admin'), deleteFloor);

// Room Types
router.post('/room-types', requireAuth, requireHotel('hotelId', 'hotel_admin'), createRoomType);
router.get('/room-types', requireAuth, requireHotel('hotelId'), getRoomTypes);
router.put('/room-types/:id', requireAuth, requireHotel('hotelId', 'hotel_admin'), updateRoomType);
router.delete('/room-types/:id', requireAuth, requireHotel('hotelId', 'hotel_admin'), deleteRoomType);

// Rooms
router.post('/rooms', requireAuth, requireHotel('hotelId', 'hotel_admin'), createRoom);
router.post('/rooms/bulk', requireAuth, requireHotel('hotelId', 'hotel_admin'), createRoomsBulk);
router.get('/available-rooms', requireAuth, requireHotel('hotelId'), getAvailableRooms);
router.get('/rooms', requireAuth, requireHotel('hotelId'), getRooms);
router.put('/rooms/:id', requireAuth, requireHotel('hotelId'), updateRoom); // Housekeeping can update status (role check inside or allow all hotel staff?)
// Actually requireHotel checks membership. requireRole checks role.
// We should probably keep requireRole for specific permissions if requireHotel doesn't cover it granularly.
// requireHotel('hotelId', 'hotel_admin') enforces hotel_admin.
// For updateRoom, we might want HOUSEKEEPING too.
// So we use requireHotel('hotelId') for membership, and requireRole for specific roles.

router.put('/rooms/:id', requireAuth, requireHotel('hotelId'), requireRole(['HOTEL_ADMIN', 'MANAGER', 'HOUSEKEEPING']), updateRoom);
router.delete('/rooms/:id', requireAuth, requireHotel('hotelId', 'hotel_admin'), deleteRoom);

export default router;
