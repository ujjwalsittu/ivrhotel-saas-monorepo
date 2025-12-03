import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    hotelId: mongoose.Types.ObjectId;
    guestId: mongoose.Types.ObjectId;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    roomId?: mongoose.Types.ObjectId; // Optional initially, assigned later
    roomTypeId: mongoose.Types.ObjectId;
    checkInDate: Date;
    checkOutDate: Date;
    status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
    paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
    kycStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
    kycToken?: string;
    totalAmount: number;
    paidAmount: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        guestId: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
        guestName: { type: String },
        guestEmail: { type: String },
        guestPhone: { type: String },
        roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
        roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
        checkInDate: { type: Date, required: true },
        checkOutDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'],
            default: 'CONFIRMED',
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'],
            default: 'PENDING',
        },
        kycStatus: {
            type: String,
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED'],
            default: 'PENDING',
        },
        kycToken: { type: String },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        notes: { type: String },
    },
    { timestamps: true }
);

BookingSchema.index({ hotelId: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ hotelId: 1, status: 1 });
BookingSchema.index({ hotelId: 1, status: 1, checkInDate: 1 }); // Optimized for occupancy queries

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
