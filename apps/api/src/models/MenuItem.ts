import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    category: 'FOOD' | 'BEVERAGE' | 'SERVICE' | 'OTHER';
    imageUrl?: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, enum: ['FOOD', 'BEVERAGE', 'SERVICE', 'OTHER'], default: 'FOOD' },
        imageUrl: { type: String },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
