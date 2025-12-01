import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Folio } from '../models/Folio';

/**
 * Generate daily sales report
 */
export const getDailySalesReport = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { date } = req.query;

        const reportDate = date ? new Date(date as string) : new Date();
        const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

        // Get bookings for the day
        const bookings = await Booking.find({
            hotelId,
            checkInDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('guestId', 'name email');

        // Get payments for the day
        const folios = await Folio.find({
            hotelId,
            'payments.date': { $gte: startOfDay, $lte: endOfDay }
        });

        const totalBookings = bookings.length;
        const totalRevenue = folios.reduce((sum, folio) => {
            const dayPayments = folio.payments.filter(p =>
                p.date >= startOfDay && p.date <= endOfDay && p.status === 'SUCCESS'
            );
            return sum + dayPayments.reduce((pSum, p) => pSum + p.amount, 0);
        }, 0);

        const report = {
            date: reportDate,
            totalBookings,
            totalRevenue,
            checkIns: bookings.filter(b => b.status === 'CHECKED_IN').length,
            checkOuts: bookings.filter(b => b.status === 'CHECKED_OUT').length,
            bookings: bookings.map(b => ({
                id: b._id,
                guestId: b.guestId,
                roomType: b.roomTypeId,
                status: b.status,
                checkIn: b.checkInDate,
                checkOut: b.checkOutDate
            }))
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating sales report', error });
    }
};

/**
 * Generate occupancy report
 */
export const getOccupancyReport = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate as string) : new Date();
        const end = endDate ? new Date(endDate as string) : new Date();

        const bookings = await Booking.find({
            hotelId,
            $or: [
                { checkInDate: { $gte: start, $lte: end } },
                { checkOutDate: { $gte: start, $lte: end } },
                {
                    checkInDate: { $lte: start },
                    checkOutDate: { $gte: end }
                }
            ]
        });

        // Calculate daily occupancy
        const dailyOccupancy: Record<string, number> = {};
        const totalRooms = 100; // TODO: Get from hotel model

        bookings.forEach(booking => {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);

            for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                dailyOccupancy[dateKey] = (dailyOccupancy[dateKey] || 0) + 1;
            }
        });

        const report = {
            period: { start, end },
            totalRooms,
            dailyOccupancy: Object.entries(dailyOccupancy).map(([date, occupied]) => ({
                date,
                occupied,
                occupancyRate: ((occupied / totalRooms) * 100).toFixed(2)
            })),
            averageOccupancy: (
                Object.values(dailyOccupancy).reduce((sum, val) => sum + val, 0) /
                Object.keys(dailyOccupancy).length /
                totalRooms * 100
            ).toFixed(2)
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating occupancy report', error });
    }
};

/**
 * Export report as CSV
 */
export const exportReportCSV = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { type, date } = req.query;

        let csvData = '';

        if (type === 'sales') {
            const reportDate = date ? new Date(date as string) : new Date();
            const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

            const bookings = await Booking.find({
                hotelId,
                checkInDate: { $gte: startOfDay, $lte: endOfDay }
            }).populate('guestId', 'name');

            csvData = 'Booking ID,Guest ID,Check In,Check Out,Status\n';
            bookings.forEach(b => {
                csvData += `${b._id},${b.guestId},${b.checkInDate},${b.checkOutDate},${b.status}\n`;
            });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.csv`);
        res.send(csvData);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting report', error });
    }
};
