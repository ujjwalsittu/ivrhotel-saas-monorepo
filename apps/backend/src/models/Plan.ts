import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'MONTHLY' | 'YEARLY';

    modules: {
        name: string; // e.g., 'PMS', 'POS', 'CHANNEL_MANAGER'
        enabled: boolean;
        limits?: any;
    }[];

    isActive: boolean;
}

const PlanSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        interval: { type: String, enum: ['MONTHLY', 'YEARLY'], default: 'MONTHLY' },

        modules: [{
            name: { type: String, required: true },
            enabled: { type: Boolean, default: true },
            limits: { type: Schema.Types.Mixed },
        }],

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
