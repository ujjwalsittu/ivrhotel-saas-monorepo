import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Folio } from '../models/Folio';
import { Hotel } from '../models/Hotel';
import { Room } from '../models/Room';
import { PricingRule } from '../models/PricingRule';
import { z } from 'zod';

// --- Validation Schemas ---

const createPricingRuleSchema = z.object({
    name: z.string().min(1),
    roomTypeId: z.string(),
    condition: z.object({
        type: z.enum(['OCCUPANCY', 'DATE_RANGE', 'DAY_OF_WEEK']),
        value: z.any()
    }),
    action: z.object({
        type: z.enum(['PERCENTAGE_ADJUSTMENT', 'FIXED_ADJUSTMENT']),
        value: z.number()
    }),
    priority: z.number().default(0),
    active: z.boolean().default(true)
});

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
        const totalRooms = await Room.countDocuments({ hotelId });

        // Get currently occupied rooms (checked in bookings that haven't checked out yet)
        const now = new Date();
        const occupiedRooms = await Booking.countDocuments({
            hotelId,
            status: 'CHECKED_IN',
            checkInDate: { $lte: now },
            checkOutDate: { $gte: now }
        });

        const availableRooms = totalRooms - occupiedRooms;
        const currentOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Mock trend for now (calculating historical occupancy is expensive without pre-aggregation)
        const trend = [
            { date: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0], occupancy: Math.max(0, currentOccupancy - 5) },
            { date: new Date(now.getTime() - 1 * 86400000).toISOString().split('T')[0], occupancy: Math.max(0, currentOccupancy - 2) },
            { date: now.toISOString().split('T')[0], occupancy: currentOccupancy }
        ];

        res.json({
            currentOccupancy,
            totalRooms,
            occupiedRooms,
            availableRooms,
            trend
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching occupancy', error });
    }
};

// --- Pricing Rules ---

export const getPricingRules = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const rules = await PricingRule.find({ hotelId }).sort({ priority: -1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pricing rules', error });
    }
};

export const createPricingRule = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createPricingRuleSchema.parse(req.body);

        const rule = new PricingRule({ ...validatedData, hotelId });
        await rule.save();
        res.status(201).json(rule);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating pricing rule', error });
    }
};

export const deletePricingRule = async (req: Request, res: Response) => {
    try {
        const { ruleId } = req.params;
        await PricingRule.findByIdAndDelete(ruleId);
        res.json({ message: 'Pricing rule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pricing rule', error });
    }
};
