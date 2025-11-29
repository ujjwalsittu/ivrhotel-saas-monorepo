import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Guest } from '../models/Guest';
import { Room } from '../models/Room';
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
});

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createBookingSchema.parse(req.body);

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
            // Update guest info if provided? For now, let's keep existing.
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
        const { status, from, to } = req.query;

        const query: any = { hotelId };
        if (status) query.status = status;
        if (from && to) {
            query.checkInDate = { $gte: new Date(from as string), $lte: new Date(to as string) };
        }

        const bookings = await Booking.find(query)
            .populate('guestId')
            .populate('roomTypeId')
            .populate('roomId')
            .sort({ checkInDate: 1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required for check-in' });
        }

        // Check if room is available
        const room = await Room.findById(roomId);
        if (!room || room.status !== 'CLEAN') { // Or whatever logic for availability
            return res.status(400).json({ message: 'Room is not available' });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status: 'CHECKED_IN', roomId, checkInDate: new Date() }, // Update actual check-in time?
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

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
