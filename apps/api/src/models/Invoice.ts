import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
    hotelId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    guestId: mongoose.Types.ObjectId;
    items: {
        description: string;
        amount: number;
        type: 'ROOM_CHARGE' | 'POS_ORDER' | 'SERVICE' | 'TAX' | 'OTHER';
        referenceId?: mongoose.Types.ObjectId; // e.g., Order ID
    }[];
    totalAmount: number;
    paidAmount: number;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
    paymentMethod?: 'CASH' | 'CARD' | 'ONLINE' | 'OTHER';
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        guestId: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
        items: [{
            description: { type: String, required: true },
            amount: { type: Number, required: true, min: 0 },
            type: { type: String, enum: ['ROOM_CHARGE', 'POS_ORDER', 'SERVICE', 'TAX', 'OTHER'], required: true },
            referenceId: { type: Schema.Types.ObjectId }
        }],
        totalAmount: { type: Number, required: true, min: 0 },
        paidAmount: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'], default: 'DRAFT' },
        paymentMethod: { type: String, enum: ['CASH', 'CARD', 'ONLINE', 'OTHER'] },
    },
    { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
