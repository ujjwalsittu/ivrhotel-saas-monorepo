import mongoose, { Schema, Document } from 'mongoose';

export interface IHousekeepingTask extends Document {
    hotelId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    type: 'CLEANING' | 'MAINTENANCE';
    description?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assignedTo?: mongoose.Types.ObjectId;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: Date;
    updatedAt: Date;
}

const HousekeepingTaskSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
        type: { type: String, enum: ['CLEANING', 'MAINTENANCE'], default: 'CLEANING' },
        description: { type: String },
        status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    },
    { timestamps: true }
);

export const HousekeepingTask = mongoose.model<IHousekeepingTask>('HousekeepingTask', HousekeepingTaskSchema);
