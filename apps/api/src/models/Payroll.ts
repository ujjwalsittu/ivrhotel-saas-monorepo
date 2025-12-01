import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
    hotelId: mongoose.Types.ObjectId;
    staffId: mongoose.Types.ObjectId;
    month: number; // 1-12
    year: number;
    basicSalary: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    status: 'PENDING' | 'PAID';
    paymentDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
        basicSalary: { type: Number, required: true, min: 0 },
        bonuses: { type: Number, default: 0, min: 0 },
        deductions: { type: Number, default: 0, min: 0 },
        netSalary: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

export const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);
