import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { Booking } from '../models/Booking';
import { startOfDay, endOfDay } from 'date-fns';

export const getHotelStats = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        // Room Stats
        const totalRooms = await Room.countDocuments({ hotelId });
        const availableRooms = await Room.countDocuments({ hotelId, status: 'AVAILABLE' });
        const occupiedRooms = await Room.countDocuments({ hotelId, status: 'OCCUPIED' });
        const dirtyRooms = await Room.countDocuments({ hotelId, status: 'DIRTY' });
        const maintenanceRooms = await Room.countDocuments({ hotelId, status: 'MAINTENANCE' });

        // Date ranges for today
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Booking Stats - Today's Check-ins
        const checkInsToday = await Booking.countDocuments({
            hotelId,
            checkInDate: { $gte: todayStart, $lte: todayEnd },
            status: { $in: ['CONFIRMED', 'CHECKED_IN'] }
        });
        const pendingCheckIns = await Booking.countDocuments({
            hotelId,
            checkInDate: { $gte: todayStart, $lte: todayEnd },
            status: 'CONFIRMED'
        });

        // Booking Stats - Today's Check-outs
        const checkOutsToday = await Booking.countDocuments({
            hotelId,
            checkOutDate: { $gte: todayStart, $lte: todayEnd },
            status: { $in: ['CHECKED_IN', 'CHECKED_OUT'] }
        });
        const pendingCheckOuts = await Booking.countDocuments({
            hotelId,
            checkOutDate: { $gte: todayStart, $lte: todayEnd },
            status: 'CHECKED_IN'
        });

        // Recent Bookings
        const recentBookings = await Booking.find({ hotelId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('guestId', 'name email phone')
            .populate('roomId', 'number');

        res.json({
            rooms: {
                total: totalRooms,
                available: availableRooms,
                occupied: occupiedRooms,
                dirty: dirtyRooms,
                maintenance: maintenanceRooms
            },
            bookings: {
                todayCheckIns: checkInsToday,
                pendingCheckIns: pendingCheckIns,
                todayCheckOuts: checkOutsToday,
                pendingCheckOuts: pendingCheckOuts
            },
            recentBookings
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
};
