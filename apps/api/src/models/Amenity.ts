import mongoose, { Schema, Document } from 'mongoose';

export interface IAmenity extends Document {
    name: string;
    code: string;
    category: string;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AmenitySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true, uppercase: true },
        category: { type: String, required: true }, // e.g., 'General', 'Wellness', 'Services'
        icon: { type: String, required: true }, // Lucide icon name
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const Amenity = mongoose.model<IAmenity>('Amenity', AmenitySchema);
