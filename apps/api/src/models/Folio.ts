import mongoose, { Schema, Document } from 'mongoose';

interface ICharge {
    type: 'ROOM' | 'FOOD' | 'BEVERAGE' | 'SERVICE' | 'TAX' | 'OTHER';
    description: string;
    amount: number;
    quantity: number;
    date: Date;
    posted: boolean;
    postedBy?: mongoose.Types.ObjectId;
}

interface IPayment {
    method: 'CARD' | 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'WALLET';
    amount: number;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    date: Date;
    refundedAmount?: number;
    refundedAt?: Date;
}

export interface IFolio extends Document {
    bookingId: mongoose.Types.ObjectId;
    guestId?: mongoose.Types.ObjectId;
    hotelId: mongoose.Types.ObjectId;

    charges: ICharge[];
    payments: IPayment[];

    // Auto-calculated fields
    totalCharges: number;
    totalPayments: number;
    balance: number;

    status: 'OPEN' | 'CLOSED' | 'SETTLED';
    settledAt?: Date;

    createdAt: Date;
    updatedAt: Date;

    // Methods
    addCharge(charge: Partial<ICharge>): Promise<IFolio>;
    addPayment(payment: Partial<IPayment>): Promise<IFolio>;
    settle(): Promise<IFolio>;
}

const ChargeSchema = new Schema({
    type: {
        type: String,
        enum: ['ROOM', 'FOOD', 'BEVERAGE', 'SERVICE', 'TAX', 'OTHER'],
        required: true
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    date: { type: Date, default: Date.now },
    posted: { type: Boolean, default: false },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const PaymentSchema = new Schema({
    method: {
        type: String,
        enum: ['CARD', 'CASH', 'UPI', 'BANK_TRANSFER', 'WALLET'],
        required: true
    },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    date: { type: Date, default: Date.now },
    refundedAmount: { type: Number },
    refundedAt: { type: Date }
}, { _id: true });

const FolioSchema: Schema = new Schema(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
        guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },

        charges: [ChargeSchema],
        payments: [PaymentSchema],

        totalCharges: { type: Number, default: 0 },
        totalPayments: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ['OPEN', 'CLOSED', 'SETTLED'],
            default: 'OPEN'
        },
        settledAt: { type: Date }
    },
    { timestamps: true }
);

// Pre-save hook to calculate totals
FolioSchema.pre('save', function (this: IFolio, next) {
    if (this.charges) {
        this.totalCharges = this.charges.reduce((sum: number, charge: ICharge) => sum + (charge.amount * charge.quantity), 0);
    }
    if (this.payments) {
        this.totalPayments = this.payments
            .filter((p: IPayment) => p.status === 'SUCCESS')
            .reduce((sum: number, payment: IPayment) => sum + payment.amount, 0);
    }
    this.balance = this.totalCharges - this.totalPayments;
    next();
});

// Methods
FolioSchema.methods.addCharge = function (this: IFolio, charge: Partial<ICharge>) {
    this.charges.push(charge as ICharge);
    return this.save();
};

FolioSchema.methods.addPayment = function (this: IFolio, payment: Partial<IPayment>) {
    this.payments.push(payment as IPayment);
    return this.save();
};

FolioSchema.methods.settle = function (this: IFolio) {
    if (this.balance <= 0) {
        this.status = 'SETTLED';
        this.settledAt = new Date();
        return this.save();
    }
    throw new Error('Cannot settle folio with outstanding balance');
};

// Indexes
FolioSchema.index({ bookingId: 1 });
FolioSchema.index({ hotelId: 1, status: 1 });

export const Folio = mongoose.model<IFolio>('Folio', FolioSchema);
