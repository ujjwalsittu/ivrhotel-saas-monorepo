import { Request, Response } from 'express';
import { Folio } from '../models/Folio';
import { Booking } from '../models/Booking';
import * as razorpayService from '../services/payment/razorpay.service';
import { z } from 'zod';

/**
 * Create Razorpay order for payment
 */
export const createPaymentOrder = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { amount } = req.body; // amount in INR

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Convert to paise
        const amountInPaise = Math.round(amount * 100);

        // Create Razorpay order
        const result = await razorpayService.createOrder({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId: bookingId.toString(),
                hotelId: booking.hotelId.toString()
            }
        });

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        // Create or update folio
        let folio = await Folio.findOne({ bookingId });
        if (!folio) {
            folio = new Folio({
                bookingId,
                hotelId: booking.hotelId,
                guestId: booking.guestId
            });
        }

        // Add pending payment
        await folio.addPayment({
            method: 'CARD',
            amount,
            razorpayOrderId: result.orderId,
            status: 'PENDING'
        });

        res.json({
            success: true,
            orderId: result.orderId,
            amount: result.amount,
            currency: result.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create payment order error:', error);
        res.status(500).json({ message: 'Error creating payment order', error });
    }
};

/**
 * Verify and capture payment after successful authorization
 */
export const capturePayment = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { paymentId, orderId, signature } = req.body;

        // Verify signature (security check)
        const body = orderId + '|' + paymentId;
        const expectedSignature = require('crypto')
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const folio = await Folio.findOne({ bookingId });
        if (!folio) {
            return res.status(404).json({ message: 'Folio not found' });
        }

        // Find the pending payment
        const payment = folio.payments.find(p => p.razorpayOrderId === orderId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Capture payment
        const result = await razorpayService.capturePayment({
            paymentId,
            amount: payment.amount * 100 // Convert to paise
        });

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        // Update payment status
        payment.status = 'SUCCESS';
        payment.razorpayPaymentId = paymentId;
        await folio.save();

        res.json({
            success: true,
            message: 'Payment captured successfully',
            payment: {
                id: paymentId,
                amount: payment.amount,
                status: 'SUCCESS'
            }
        });
    } catch (error) {
        console.error('Capture payment error:', error);
        res.status(500).json({ message: 'Error capturing payment', error });
    }
};

/**
 * Process refund
 */
export const processRefund = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { paymentId, amount, reason } = req.body; // amount optional for partial refund

        const folio = await Folio.findOne({ bookingId });
        if (!folio) {
            return res.status(404).json({ message: 'Folio not found' });
        }

        const payment = folio.payments.find(p => p.razorpayPaymentId === paymentId);
        if (!payment || payment.status !== 'SUCCESS') {
            return res.status(400).json({ message: 'Payment not found or not successful' });
        }

        // Process refund
        const result = await razorpayService.refundPayment({
            paymentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Partial or full
            notes: { reason }
        });

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        // Update payment
        payment.status = 'REFUNDED';
        payment.refundedAmount = (result.amount || 0) / 100;
        payment.refundedAt = new Date();
        await folio.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refund: {
                id: result.refundId,
                amount: (result.amount || 0) / 100,
                status: result.status
            }
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Error processing refund', error });
    }
};

/**
 * Add charge to folio
 */
export const addCharge = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const chargeSchema = z.object({
            type: z.enum(['ROOM', 'FOOD', 'BEVERAGE', 'SERVICE', 'TAX', 'OTHER']),
            description: z.string(),
            amount: z.number().positive(),
            quantity: z.number().positive().default(1)
        });

        const charge = chargeSchema.parse(req.body);

        let folio = await Folio.findOne({ bookingId });
        if (!folio) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            folio = new Folio({
                bookingId,
                hotelId: booking.hotelId,
                guestId: booking.guestId
            });
        }

        await folio.addCharge({
            ...charge,
            ...charge,
            postedBy: (req as any).user?.id,
            posted: true
        });

        res.json({
            success: true,
            folio
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error adding charge', error });
    }
};

/**
 * Get folio for booking
 */
export const getFolio = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        const folio = await Folio.findOne({ bookingId })
            .populate('bookingId')
            .populate('guestId');

        if (!folio) {
            return res.status(404).json({ message: 'Folio not found' });
        }

        res.json(folio);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching folio', error });
    }
};

/**
 * Razorpay webhook handler
 */
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        const payload = JSON.stringify(req.body);

        // Verify signature
        const isValid = razorpayService.verifyWebhookSignature(payload, signature);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                // Payment was captured
                console.log('Payment captured:', paymentEntity.id);
                break;

            case 'payment.failed':
                // Payment failed
                const folio = await Folio.findOne({
                    'payments.razorpayPaymentId': paymentEntity.id
                });
                if (folio) {
                    const payment = folio.payments.find(p => p.razorpayPaymentId === paymentEntity.id);
                    if (payment) {
                        payment.status = 'FAILED';
                        await folio.save();
                    }
                }
                break;

            case 'refund.processed':
                // Refund was processed
                console.log('Refund processed:', paymentEntity.id);
                break;
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing error' });
    }
};
