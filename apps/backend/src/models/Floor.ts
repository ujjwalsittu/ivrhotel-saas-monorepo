import mongoose, { Schema, Document } from 'mongoose';

export interface IFloor extends Document {
    hotelId: mongoose.Types.ObjectId;
    number: number; // 0, 1, 2...
    name: string; // "Ground Floor", "First Floor"
    block?: string; // "Wing A", "Main Building"
    isActive: boolean;
}

const FloorSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        number: { type: Number, required: true },
        name: { type: String, required: true },
        block: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

FloorSchema.index({ hotelId: 1, number: 1, block: 1 }, { unique: true });

export const Floor = mongoose.model<IFloor>('Floor', FloorSchema);
