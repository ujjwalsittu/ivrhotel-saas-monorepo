import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomType extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string; // "Deluxe", "Suite"
    description?: string;
    basePrice: number;
    currency: string;
    maxOccupancy: {
        adults: number;
        children: number;
    };
    amenities: string[]; // ["WiFi", "AC", "TV"]
    photos: string[];
    isActive: boolean;
}

const RoomTypeSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        description: { type: String },
        basePrice: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        maxOccupancy: {
            adults: { type: Number, default: 2 },
            children: { type: Number, default: 1 },
        },
        amenities: [{ type: String }],
        photos: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

RoomTypeSchema.index({ hotelId: 1, name: 1 }, { unique: true });

export const RoomType = mongoose.model<IRoomType>('RoomType', RoomTypeSchema);
