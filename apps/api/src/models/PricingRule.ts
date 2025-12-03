import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingRule extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    roomTypeId: mongoose.Types.ObjectId;
    condition: {
        type: 'OCCUPANCY' | 'DATE_RANGE' | 'DAY_OF_WEEK';
        value: any; // e.g., 80 (for 80% occupancy), or { start: Date, end: Date }
    };
    action: {
        type: 'PERCENTAGE_ADJUSTMENT' | 'FIXED_ADJUSTMENT';
        value: number; // e.g., 10 (for +10%) or -50 (for -$50)
    };
    priority: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PricingRuleSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
        condition: {
            type: {
                type: String,
                enum: ['OCCUPANCY', 'DATE_RANGE', 'DAY_OF_WEEK'],
                required: true
            },
            value: { type: Schema.Types.Mixed, required: true }
        },
        action: {
            type: {
                type: String,
                enum: ['PERCENTAGE_ADJUSTMENT', 'FIXED_ADJUSTMENT'],
                required: true
            },
            value: { type: Number, required: true }
        },
        priority: { type: Number, default: 0 },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

PricingRuleSchema.index({ hotelId: 1, active: 1 });
PricingRuleSchema.index({ roomTypeId: 1 });

export const PricingRule = mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);
