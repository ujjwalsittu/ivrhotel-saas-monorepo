import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageTemplate extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    type: 'booking_confirmation' | 'check_in_reminder' | 'payment_receipt' | 'kyc_request' | 'custom';
    channels: ('EMAIL' | 'SMS' | 'WHATSAPP')[];

    content: {
        subject?: string; // For email
        body: string; // Supports variables {{guestName}}, {{checkInDate}}, etc.
    };

    active: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const MessageTemplateSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['booking_confirmation', 'check_in_reminder', 'payment_receipt', 'kyc_request', 'custom'],
            required: true
        },
        channels: [{
            type: String,
            enum: ['EMAIL', 'SMS', 'WHATSAPP']
        }],

        content: {
            subject: { type: String },
            body: { type: String, required: true }
        },

        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Indexes
MessageTemplateSchema.index({ hotelId: 1, type: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema);
