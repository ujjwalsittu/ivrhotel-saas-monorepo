import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    hotelId: mongoose.Types.ObjectId;
    number: string; // "101", "102"
    floorId: mongoose.Types.ObjectId;
    roomTypeId: mongoose.Types.ObjectId;
    status: 'CLEAN' | 'DIRTY' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER';
    features: string[]; // Specific features for this room instance
    isActive: boolean;
}

const RoomSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        number: { type: String, required: true },
        floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
        roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
        status: {
            type: String,
            enum: ['CLEAN', 'DIRTY', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'],
            default: 'CLEAN'
        },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

RoomSchema.index({ hotelId: 1, number: 1 }, { unique: true });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
