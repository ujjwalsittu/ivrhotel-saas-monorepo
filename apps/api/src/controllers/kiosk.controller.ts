import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Room } from '../models/Room';
import { z } from 'zod';

const findBookingSchema = z.object({
    referenceId: z.string().min(1)
});

const checkInSchema = z.object({
    bookingId: z.string().min(1)
});

const checkOutSchema = z.object({
    bookingId: z.string().min(1)
});

export const findBooking = async (req: Request, res: Response) => {
    try {
        const { referenceId } = findBookingSchema.parse(req.body);

        // In a real app, we'd probably search by booking reference code, not ID directly
        // For MVP, we'll assume referenceId is the booking ID or a unique code
        const booking = await Booking.findOne({
            $or: [{ _id: referenceId }, { 'guest.email': referenceId }] // Simple fallback
        }).populate('roomTypeId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: 'Invalid request', error });
    }
};

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { bookingId } = checkInSchema.parse(req.body);

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ message: `Cannot check in. Current status: ${booking.status}` });
        }

        // Auto-assign room if not assigned
        if (!booking.roomId) {
            const availableRoom = await Room.findOne({
                hotelId: booking.hotelId,
                typeId: booking.roomTypeId,
                status: 'CLEAN' // Simplified availability check
            });

            if (!availableRoom) {
                return res.status(400).json({ message: 'No clean rooms available for auto-assignment' });
            }

            booking.roomId = availableRoom._id as any;

            // Update room status
            availableRoom.status = 'OCCUPIED';
            await availableRoom.save();
        }

        booking.status = 'CHECKED_IN';
        booking.checkInDate = new Date(); // Actual check-in time
        await booking.save();

        // Mock Key Card Encoding
        const keyCardData = {
            roomId: booking.roomId,
            validUntil: booking.checkOutDate,
            code: Math.random().toString(36).substring(7).toUpperCase()
        };

        res.json({ booking, keyCardData });
    } catch (error) {
        res.status(500).json({ message: 'Check-in failed', error });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    try {
        const { bookingId } = checkOutSchema.parse(req.body);

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'CHECKED_IN') {
            return res.status(400).json({ message: `Cannot check out. Current status: ${booking.status}` });
        }

        // Update room status to DIRTY
        if (booking.roomId) {
            await Room.findByIdAndUpdate(booking.roomId, { status: 'DIRTY' });
        }

        booking.status = 'CHECKED_OUT';
        booking.checkOutDate = new Date(); // Actual check-out time
        await booking.save();

        // Mock Bill Generation
        const bill = {
            totalAmount: booking.totalAmount,
            paid: true, // Mock payment
            invoiceId: `INV-${Date.now()}`
        };

        res.json({ booking, bill });
    } catch (error) {
        res.status(500).json({ message: 'Check-out failed', error });
    }
};
