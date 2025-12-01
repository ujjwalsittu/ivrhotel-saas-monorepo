import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: string; // 'SUPER_ADMIN', 'HOTEL_OWNER', 'HOTEL_ADMIN', 'STAFF', etc.
    hotelId?: mongoose.Types.ObjectId; // Null for Super Admin
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional if using OAuth only, but we'll likely use email/pass too
        name: { type: String, required: true },
        role: { type: String, required: true, default: 'STAFF' },
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel' },
        permissions: [{ type: String }],
    },
    { timestamps: true }
);

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ hotelId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
