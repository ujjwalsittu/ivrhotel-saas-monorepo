import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    hotelId: mongoose.Types.ObjectId;
    roomId?: mongoose.Types.ObjectId;
    guestId?: mongoose.Types.ObjectId;
    items: {
        menuItemId: mongoose.Types.ObjectId;
        name: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID';
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
        guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
        items: [{
            menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
        }],
        totalAmount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
        paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
    },
    { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
