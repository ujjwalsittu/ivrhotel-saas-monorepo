import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
    hotelId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    idProof?: {
        type: string; // 'PASSPORT', 'DRIVING_LICENSE', 'NATIONAL_ID'
        number: string;
        url?: string; // URL to uploaded document
    };
    selfieUrl?: string;
    kycStatus?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GuestSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String },
        idProof: {
            type: { type: String },
            number: { type: String },
            url: { type: String },
        },
        selfieUrl: { type: String },
        kycStatus: { type: String },
    },
    { timestamps: true }
);

GuestSchema.index({ hotelId: 1, phone: 1 });
GuestSchema.index({ hotelId: 1, email: 1 });

export const Guest = mongoose.model<IGuest>('Guest', GuestSchema);
