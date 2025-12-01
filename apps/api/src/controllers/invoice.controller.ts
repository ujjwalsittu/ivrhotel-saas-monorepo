import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Booking } from '../models/Booking';
import { Order } from '../models/Order';
import { Room } from '../models/Room';
import { differenceInDays } from 'date-fns';

export const generateInvoice = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId).populate('roomId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // 1. Calculate Room Charges
        const room = booking.roomId as any;
        const nights = differenceInDays(new Date(booking.checkOutDate), new Date(booking.checkInDate)) || 1;
        const roomTotal = nights * room.price;

        const items: any[] = [
            {
                description: `Room Charge (${nights} nights @ ${room.price})`,
                amount: roomTotal,
                type: 'ROOM_CHARGE'
            }
        ];

        // 2. Fetch Unpaid POS Orders
        // We look for orders linked to this booking/room that are COMPLETED but not PAID (or maybe we just bill everything linked to the booking)
        // Assuming orders are linked via roomId and guestId. For simplicity, let's query by roomId and time range if needed, 
        // or better, if we had bookingId on Order. Since we have roomId on Order, let's use that + date range.
        const orders = await Order.find({
            hotelId,
            roomId: booking.roomId,
            paymentStatus: 'PENDING',
            status: { $ne: 'CANCELLED' },
            createdAt: { $gte: booking.checkInDate, $lte: booking.checkOutDate }
        });

        let posTotal = 0;
        orders.forEach(order => {
            items.push({
                description: `POS Order #${order._id.toString().slice(-4)}`,
                amount: order.totalAmount,
                type: 'POS_ORDER',
                referenceId: order._id
            });
            posTotal += order.totalAmount;
        });

        const totalAmount = roomTotal + posTotal;

        // Check if invoice already exists
        let invoice = await Invoice.findOne({ bookingId });
        if (invoice) {
            // Update existing draft
            if (invoice.status === 'DRAFT') {
                invoice.items = items;
                invoice.totalAmount = totalAmount;
                await invoice.save();
                return res.json(invoice);
            } else {
                return res.status(400).json({ message: 'Invoice already issued for this booking' });
            }
        }

        // Create new invoice
        invoice = new Invoice({
            hotelId,
            bookingId,
            guestId: booking.guestId,
            items,
            totalAmount,
            status: 'DRAFT'
        });

        await invoice.save();
        res.status(201).json(invoice);

    } catch (error) {
        res.status(500).json({ message: 'Error generating invoice', error });
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const invoices = await Invoice.find({ hotelId })
            .populate('bookingId')
            .populate('guestId')
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error });
    }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id)
            .populate('bookingId')
            .populate('guestId')
            .populate('items.referenceId'); // Populate order details if needed

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice', error });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, method } = req.body;

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        invoice.paidAmount += amount;
        invoice.paymentMethod = method;

        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = 'PAID';
            // Also mark linked POS orders as PAID
            const orderIds = invoice.items
                .filter(i => i.type === 'POS_ORDER' && i.referenceId)
                .map(i => i.referenceId);

            if (orderIds.length > 0) {
                await Order.updateMany(
                    { _id: { $in: orderIds } },
                    { paymentStatus: 'PAID' }
                );
            }
        } else {
            invoice.status = 'ISSUED'; // Partially paid
        }

        await invoice.save();
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment', error });
    }
};
