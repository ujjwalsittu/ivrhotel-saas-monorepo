import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    segment: {
        criteria: any; // Flexible criteria object
    };
    templateId: mongoose.Types.ObjectId;
    status: 'DRAFT' | 'SCHEDULED' | 'SENT';
    scheduledAt?: Date;
    stats: {
        sent: number;
        opened: number;
        clicked: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        segment: {
            criteria: { type: Schema.Types.Mixed, default: {} }
        },
        templateId: { type: Schema.Types.ObjectId, ref: 'MessageTemplate', required: true },
        status: {
            type: String,
            enum: ['DRAFT', 'SCHEDULED', 'SENT'],
            default: 'DRAFT'
        },
        scheduledAt: { type: Date },
        stats: {
            sent: { type: Number, default: 0 },
            opened: { type: Number, default: 0 },
            clicked: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

CampaignSchema.index({ hotelId: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
