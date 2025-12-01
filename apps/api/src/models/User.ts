import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Omit<Document, '_id'> {
    _id: string; // Better Auth uses string IDs
    email: string;
    emailVerified: boolean;
    password?: string;
    name: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;

    // Custom fields
    role: string;
    brandId?: string;
    primaryHotelId?: string;
    phoneNumber?: string;
    permissions?: string[]; // Managed by app logic, not better-auth core
}

const UserSchema: Schema = new Schema(
    {
        _id: { type: String, required: true }, // Override default ObjectId
        email: { type: String, required: true, unique: true },
        emailVerified: { type: Boolean, default: false },
        password: { type: String },
        name: { type: String, required: true },
        image: { type: String },

        // Custom fields
        role: { type: String, default: 'user' },
        brandId: { type: String },
        primaryHotelId: { type: String },
        phoneNumber: { type: String },
        permissions: [{ type: String }],
    },
    {
        timestamps: true,
        _id: false // Disable auto-generation of _id since better-auth provides it? 
        // Or better-auth uses the DB's ID generation? 
        // Usually better-auth generates IDs. 
        // Let's set _id to String.
    }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ brandId: 1 });
UserSchema.index({ primaryHotelId: 1 });

export const User = mongoose.model<IUser>('user', UserSchema); // Collection name 'user' to match better-auth
