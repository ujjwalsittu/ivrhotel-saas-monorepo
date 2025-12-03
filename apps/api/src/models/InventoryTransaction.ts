import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
    hotelId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    type: 'IN' | 'OUT';
    quantity: number;
    reason?: string;
    performedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const InventoryTransactionSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        itemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        type: { type: String, enum: ['IN', 'OUT'], required: true },
        quantity: { type: Number, required: true, min: 1 },
        reason: { type: String },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
