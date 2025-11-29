import { Router } from 'express';
import {
    createFloor, getFloors, updateFloor, deleteFloor,
    createRoomType, getRoomTypes, updateRoomType, deleteRoomType,
    createRoom, getRooms, updateRoom, deleteRoom
} from '../controllers/room.controller';

const router = Router({ mergeParams: true }); // Enable access to parent params (hotelId)

// Floors
router.post('/floors', createFloor);
router.get('/floors', getFloors);
router.put('/floors/:id', updateFloor);
router.delete('/floors/:id', deleteFloor);

// Room Types
router.post('/room-types', createRoomType);
router.get('/room-types', getRoomTypes);
router.put('/room-types/:id', updateRoomType);
router.delete('/room-types/:id', deleteRoomType);

// Rooms
router.post('/rooms', createRoom);
router.get('/rooms', getRooms);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

export default router;
