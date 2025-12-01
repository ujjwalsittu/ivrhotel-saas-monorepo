/**
 * Razorpay Payment Gateway Service
 * 
 * Integrates Razorpay for payment processing with PCI-compliant handling.
 * 
 * Setup:
 * 1. Sign up at https://razorpay.com
 * 2. Get API keys from Dashboard
 * 3. Add to .env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

interface CreateOrderParams {
    amount: number; // in paise (INR)
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
}

interface CapturePaymentParams {
    paymentId: string;
    amount: number;
    currency?: string;
}

interface RefundParams {
    paymentId: string;
    amount?: number; // Partial refund if specified
    notes?: Record<string, any>;
}

/**
 * Create Razorpay order (for pre-authorization)
 */
export async function createOrder(params: CreateOrderParams) {
    try {
        const options = {
            amount: params.amount, // amount in paise
            currency: params.currency || 'INR',
            receipt: params.receipt || `receipt_${Date.now()}`,
            notes: params.notes || {},
            payment_capture: 0 // Manual capture (pre-authorization)
        };

        const order = await razorpay.orders.create(options);

        return {
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt
        };
    } catch (error: any) {
        console.error('Razorpay create order error:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to create order'
        };
    }
}

/**
 * Capture payment (after successful authorization)
 */
export async function capturePayment(params: CapturePaymentParams) {
    try {
        const payment = await razorpay.payments.capture(
            params.paymentId,
            params.amount,
            params.currency || 'INR'
        );

        return {
            success: true,
            paymentId: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            captured: payment.captured
        };
    } catch (error: any) {
        console.error('Razorpay capture error:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to capture payment'
        };
    }
}

/**
 * Refund payment (full or partial)
 */
export async function refundPayment(params: RefundParams) {
    try {
        const options: any = {
            notes: params.notes || {}
        };

        if (params.amount) {
            options.amount = params.amount; // Partial refund
        }

        const refund = await razorpay.payments.refund(params.paymentId, options);

        return {
            success: true,
            refundId: refund.id,
            paymentId: refund.payment_id,
            amount: refund.amount,
            status: refund.status
        };
    } catch (error: any) {
        console.error('Razorpay refund error:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to process refund'
        };
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string = process.env.RAZORPAY_WEBHOOK_SECRET || ''
): boolean {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}

/**
 * Fetch payment details
 */
export async function getPaymentDetails(paymentId: string) {
    try {
        const payment = await razorpay.payments.fetch(paymentId);

        return {
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                captured: payment.captured,
                refunded: payment.refund_status !== null,
                email: payment.email,
                contact: payment.contact,
                createdAt: new Date(payment.created_at * 1000)
            }
        };
    } catch (error: any) {
        console.error('Razorpay fetch payment error:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to fetch payment'
        };
    }
}

/**
 * Create customer (for card tokenization)
 */
export async function createCustomer(params: {
    name: string;
    email: string;
    contact: string;
}) {
    try {
        const customer = await razorpay.customers.create({
            name: params.name,
            email: params.email,
            contact: params.contact,
            fail_existing: false
        });

        return {
            success: true,
            customerId: customer.id
        };
    } catch (error: any) {
        console.error('Razorpay create customer error:', error);
        return {
            success: false,
            error: error.error?.description || 'Failed to create customer'
        };
    }
}
