import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyType extends Document {
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PropertyTypeSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true, uppercase: true },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const PropertyType = mongoose.model<IPropertyType>('PropertyType', PropertyTypeSchema);
