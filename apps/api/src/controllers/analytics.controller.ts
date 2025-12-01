import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Folio } from '../models/Folio';
import { Hotel } from '../models/Hotel';

/**
 * Get analytics dashboard data
 */
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate as string) : new Date();

        // Get bookings in date range
        const bookings = await Booking.find({
            hotelId,
            checkInDate: { $gte: start, $lte: end }
        });

        // Calculate metrics
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalBookings = bookings.length;
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Booking sources - default to 'DIRECT' if no source field exists
        const sourceBreakdown = bookings.reduce((acc: Record<string, number>, _b) => {
            const source = 'DIRECT'; // Default since Booking model doesn't have source field
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        // Daily revenue for chart
        const dailyRevenue = bookings.reduce((acc: Record<string, number>, b) => {
            const date = b.checkInDate.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (b.totalAmount || 0);
            return acc;
        }, {});

        res.json({
            summary: {
                totalRevenue,
                totalBookings,
                avgBookingValue,
                period: { start, end }
            },
            sourceBreakdown,
            dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
                date,
                revenue
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error });
    }
};

/**
 * Get occupancy metrics
 */
export const getOccupancy = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        // Get hotel total rooms
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // For MVP, return mock data
        res.json({
            currentOccupancy: 75,
            totalRooms: 100,
            occupiedRooms: 75,
            availableRooms: 25,
            trend: [
                { date: '2024-12-01', occupancy: 70 },
                { date: '2024-12-02', occupancy: 72 },
                { date: '2024-12-03', occupancy: 75 }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching occupancy', error });
    }
};
