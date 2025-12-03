import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    category: 'HOUSEKEEPING' | 'KITCHEN' | 'OFFICE' | 'MAINTENANCE' | 'OTHER';
    quantity: number;
    unit: string;
    minStockLevel: number;
    costPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryItemSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['HOUSEKEEPING', 'KITCHEN', 'OFFICE', 'MAINTENANCE', 'OTHER'],
            default: 'OTHER'
        },
        quantity: { type: Number, required: true, default: 0 },
        unit: { type: String, required: true }, // e.g., 'pcs', 'kg', 'liters'
        minStockLevel: { type: Number, default: 10 },
        costPrice: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound index to ensure unique item names per hotel
InventoryItemSchema.index({ hotelId: 1, name: 1 }, { unique: true });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
