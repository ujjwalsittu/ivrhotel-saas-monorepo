import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Guest } from '../models/Guest';
import { Room } from '../models/Room';
import { RoomType } from '../models/RoomType';
import { z } from 'zod';

const createBookingSchema = z.object({
    guest: z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string(),
        address: z.string().optional(),
    }),
    roomTypeId: z.string(),
    checkInDate: z.string().datetime(),
    checkOutDate: z.string().datetime(),
    totalAmount: z.number(),
    paidAmount: z.number().optional(),
    notes: z.string().optional(),
});

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createBookingSchema.parse(req.body);

        // Validate Room Type
        const roomType = await RoomType.findOne({ _id: validatedData.roomTypeId, hotelId });
        if (!roomType) {
            return res.status(400).json({ message: 'Invalid Room Type' });
        }

        // Check Availability (Basic: Total Rooms of Type - Overlapping Bookings of Type > 0)
        // This is a simplified check. A real system needs a more robust availability engine.
        const totalRooms = await Room.countDocuments({ hotelId, roomTypeId: validatedData.roomTypeId, status: { $ne: 'OUT_OF_ORDER' } });

        const overlappingBookings = await Booking.countDocuments({
            hotelId,
            roomTypeId: validatedData.roomTypeId,
            status: { $in: ['CONFIRMED', 'CHECKED_IN'] },
            $or: [
                { checkInDate: { $lt: new Date(validatedData.checkOutDate), $gte: new Date(validatedData.checkInDate) } },
                { checkOutDate: { $gt: new Date(validatedData.checkInDate), $lte: new Date(validatedData.checkOutDate) } },
                { checkInDate: { $lte: new Date(validatedData.checkInDate) }, checkOutDate: { $gte: new Date(validatedData.checkOutDate) } }
            ]
        });

        if (overlappingBookings >= totalRooms) {
            return res.status(400).json({ message: 'No rooms available for this room type on selected dates' });
        }

        // 1. Find or Create Guest
        let guest = await Guest.findOne({
            hotelId,
            phone: validatedData.guest.phone
        });

        if (!guest) {
            guest = new Guest({
                ...validatedData.guest,
                hotelId,
            });
            await guest.save();
        } else {
            // Optional: Update guest details if provided
        }

        // 2. Create Booking
        const booking = new Booking({
            hotelId,
            guestId: guest._id,
            roomTypeId: validatedData.roomTypeId,
            checkInDate: validatedData.checkInDate,
            checkOutDate: validatedData.checkOutDate,
            totalAmount: validatedData.totalAmount,
            paidAmount: validatedData.paidAmount || 0,
            status: 'CONFIRMED',
            notes: validatedData.notes
        });

        await booking.save();

        res.status(201).json(booking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating booking', error });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { status, from, to, search, page = 1, limit = 10 } = req.query;

        const query: any = { hotelId };
        if (status) query.status = status;
        if (from && to) {
            query.checkInDate = { $gte: new Date(from as string), $lte: new Date(to as string) };
        }

        // Search by guest name (requires aggregation or population match, but simple regex on guestId won't work directly if guestId is reference)
        // For simplicity in MVP without aggregation pipeline complexity for search on populated fields:
        // We'll skip deep search for now or implement a basic one if guest name was stored on booking (it's not).
        // Actually, let's leave search out for bookings for this step or just filter by status/date.
        // If search is critical, we'd need to find guests first then find bookings for those guests.

        const skip = (Number(page) - 1) * Number(limit);

        const bookings = await Booking.find(query)
            .populate('guestId')
            .populate('roomTypeId')
            .populate('roomId')
            .sort({ checkInDate: 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            data: bookings,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

export const updateBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createBookingSchema.partial().parse(req.body);

        // Note: Updating guest info via booking update is tricky. 
        // For now, we'll only update booking fields. Guest updates should be separate.
        // We might need to handle guest updates if provided.
        // Let's assume basic booking field updates for now.

        const booking = await Booking.findByIdAndUpdate(id, validatedData, { new: true });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking', error });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        // If room was assigned, we might want to free it up or mark it dirty? 
        // Usually cancelled bookings release the room availability immediately.
        // Since we check availability dynamically, changing status to CANCELLED is enough.

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error });
    }
};

const checkRoomAvailability = async (roomId: string, start: Date, end: Date, excludeBookingId?: string) => {
    const query: any = {
        roomId,
        status: { $in: ['CONFIRMED', 'CHECKED_IN'] },
        checkInDate: { $lt: end },
        checkOutDate: { $gt: start }
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(query);
    return !conflictingBooking;
};

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required for check-in' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if room is available for the booking duration
        const isAvailable = await checkRoomAvailability(roomId, booking.checkInDate, booking.checkOutDate, id);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Room is not available for the selected dates' });
        }

        // Check if room exists and is clean (optional, but good practice for immediate check-in)
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        if (room.status !== 'CLEAN') {
            // We might allow checking into a dirty room with a warning, but for now let's block it or just warn.
            // The requirement was "robust room availability".
            // Let's enforce CLEAN for check-in.
            return res.status(400).json({ message: 'Room is not clean' });
        }

        booking.status = 'CHECKED_IN';
        booking.roomId = roomId;
        booking.checkInDate = new Date(); // Update actual check-in time
        await booking.save();

        // Update Room Status
        await Room.findByIdAndUpdate(roomId, { status: 'OCCUPIED' });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error checking in', error });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'CHECKED_OUT';
        booking.checkOutDate = new Date(); // Update actual check-out time
        await booking.save();

        // Update Room Status
        if (booking.roomId) {
            await Room.findByIdAndUpdate(booking.roomId, { status: 'DIRTY' }); // Needs cleaning
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error checking out', error });
    }
};
