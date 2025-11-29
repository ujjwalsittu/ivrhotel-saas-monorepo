import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { RoomType } from '../models/RoomType';
import { Floor } from '../models/Floor';
import { z } from 'zod';

// --- Validation Schemas ---

const createFloorSchema = z.object({
    number: z.number(),
    name: z.string(),
    block: z.string().optional(),
});

const createRoomTypeSchema = z.object({
    name: z.string(),
    basePrice: z.number(),
    maxOccupancy: z.object({
        adults: z.number(),
        children: z.number(),
    }),
    amenities: z.array(z.string()).optional(),
});

const createRoomSchema = z.object({
    number: z.string(),
    floorId: z.string(),
    roomTypeId: z.string(),
    features: z.array(z.string()).optional(),
});

// --- Controllers ---

// Floor Controllers
export const createFloor = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params; // Assuming hotelId is passed in params or extracted from auth token later
        const validatedData = createFloorSchema.parse(req.body);

        const floor = new Floor({ ...validatedData, hotelId });
        await floor.save();
        res.status(201).json(floor);
    } catch (error) {
        res.status(500).json({ message: 'Error creating floor', error });
    }
};

export const getFloors = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const floors = await Floor.find({ hotelId });
        res.json(floors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floors', error });
    }
};

export const updateFloor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createFloorSchema.partial().parse(req.body);

        const floor = await Floor.findByIdAndUpdate(id, validatedData, { new: true });
        if (!floor) {
            return res.status(404).json({ message: 'Floor not found' });
        }
        res.json(floor);
    } catch (error) {
        res.status(500).json({ message: 'Error updating floor', error });
    }
};

export const deleteFloor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const floor = await Floor.findByIdAndDelete(id);
        if (!floor) {
            return res.status(404).json({ message: 'Floor not found' });
        }
        res.json({ message: 'Floor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting floor', error });
    }
};

// RoomType Controllers
export const createRoomType = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createRoomTypeSchema.parse(req.body);

        const roomType = new RoomType({ ...validatedData, hotelId });
        await roomType.save();
        res.status(201).json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room type', error });
    }
};

export const getRoomTypes = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const roomTypes = await RoomType.find({ hotelId });
        res.json(roomTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room types', error });
    }
};

export const updateRoomType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createRoomTypeSchema.partial().parse(req.body);

        const roomType = await RoomType.findByIdAndUpdate(id, validatedData, { new: true });
        if (!roomType) {
            return res.status(404).json({ message: 'Room type not found' });
        }
        res.json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room type', error });
    }
};

export const deleteRoomType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const roomType = await RoomType.findByIdAndDelete(id);
        if (!roomType) {
            return res.status(404).json({ message: 'Room type not found' });
        }
        res.json({ message: 'Room type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room type', error });
    }
};

// Room Controllers
export const createRoom = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createRoomSchema.parse(req.body);

        const room = new Room({ ...validatedData, hotelId });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
};

export const getRooms = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const rooms = await Room.find({ hotelId })
            .populate('floorId')
            .populate('roomTypeId');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createRoomSchema.partial().parse(req.body);

        const room = await Room.findByIdAndUpdate(id, validatedData, { new: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room', error });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const room = await Room.findByIdAndDelete(id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room', error });
    }
};
