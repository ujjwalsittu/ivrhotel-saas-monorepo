import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingActivity extends Document {
    bookingId: mongoose.Types.ObjectId;
    hotelId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId; // Optional, as some actions might be system automated or public
    userName?: string; // Snapshot of user name
    action: string; // e.g., 'CREATED', 'CHECKED_IN', 'PAYMENT_RECEIVED'
    details?: any; // Flexible JSON for extra info (e.g., payment amount, room number changed)
    timestamp: Date;
}

const BookingActivitySchema: Schema = new Schema(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        action: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false } // We use custom timestamp field
);

BookingActivitySchema.index({ bookingId: 1, timestamp: -1 });

export const BookingActivity = mongoose.model<IBookingActivity>('BookingActivity', BookingActivitySchema);
