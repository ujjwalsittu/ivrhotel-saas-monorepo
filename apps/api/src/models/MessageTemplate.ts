import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageTemplate extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    type: 'TRANSACTIONAL' | 'MARKETING';
    channels: ('EMAIL' | 'SMS' | 'WHATSAPP')[];
    content: {
        subject?: string;
        body: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const MessageTemplateSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['TRANSACTIONAL', 'MARKETING'],
            required: true
        },
        channels: [{
            type: String,
            enum: ['EMAIL', 'SMS', 'WHATSAPP']
        }],
        content: {
            subject: { type: String },
            body: { type: String, required: true }
        }
    },
    { timestamps: true }
);

MessageTemplateSchema.index({ hotelId: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema);
