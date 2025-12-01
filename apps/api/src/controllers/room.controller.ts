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
        const { search, page = 1, limit = 10 } = req.query;

        const query: any = { hotelId };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const floors = await Floor.find(query)
            .skip(skip)
            .limit(Number(limit));

        const total = await Floor.countDocuments(query);

        res.json({
            data: floors,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
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
        const { search, page = 1, limit = 10 } = req.query;

        const query: any = { hotelId };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const roomTypes = await RoomType.find(query)
            .skip(skip)
            .limit(Number(limit));

        const total = await RoomType.countDocuments(query);

        res.json({
            data: roomTypes,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
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
        const { status, roomTypeId, search, page = 1, limit = 10 } = req.query;

        const query: any = { hotelId };
        if (status) query.status = status;
        if (roomTypeId) query.roomTypeId = roomTypeId;
        if (search) {
            query.number = { $regex: search, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const rooms = await Room.find(query)
            .populate('floorId')
            .populate('roomTypeId')
            .skip(skip)
            .limit(Number(limit));

        const total = await Room.countDocuments(query);

        res.json({
            data: rooms,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
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
export const getAvailableRooms = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { checkInDate, checkOutDate, roomTypeId } = req.query;

        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({ message: 'Check-in and check-out dates are required' });
        }

        const start = new Date(checkInDate as string);
        const end = new Date(checkOutDate as string);

        // Find bookings that overlap with the requested dates
        // Overlap: (StartA <= EndB) and (EndA >= StartB)
        // We want to find bookings where checkInDate < end AND checkOutDate > start
        // Note: We use < and > because if one ends exactly when another starts, it's usually fine (check-out 11am, check-in 2pm)
        // But for simplicity in this system, let's assume strict overlap for now.

        // Actually, standard hotel logic:
        // Booking A: Jan 1 - Jan 3 (Nights of Jan 1, Jan 2). Checkout Jan 3.
        // Booking B: Jan 3 - Jan 5. Checkin Jan 3.
        // These do NOT overlap in terms of nights.
        // So Overlap if: Booking.checkIn < Request.checkOut AND Booking.checkOut > Request.checkIn

        const conflictingBookings = await import('../models/Booking').then(m => m.Booking.find({
            hotelId,
            status: { $in: ['CONFIRMED', 'CHECKED_IN'] },
            checkInDate: { $lt: end },
            checkOutDate: { $gt: start }
        }).select('roomId'));

        const occupiedRoomIds = conflictingBookings.map(b => b.roomId).filter(id => id);

        const query: any = {
            hotelId,
            _id: { $nin: occupiedRoomIds },
            status: 'CLEAN' // Only show clean rooms? Or maybe dirty ones too if they can be cleaned? Let's show CLEAN for now for check-in.
            // Actually for "Availability" in general (future bookings), status doesn't matter (it will be cleaned).
            // But for "Check-In Now", we probably want CLEAN rooms.
            // The prompt implies "finding available rooms" for check-in.
            // Let's stick to the plan: "Returns list of rooms that are free from overlapping bookings".
            // If it's for immediate check-in, the frontend can filter by status or we can add a param.
            // Let's just return all rooms not booked, and let frontend decide if they want to check-in to a dirty room (maybe after cleaning).
        };

        if (roomTypeId) {
            query.roomTypeId = roomTypeId;
        }

        const rooms = await Room.find(query).populate('roomTypeId');

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available rooms', error });
    }
};
