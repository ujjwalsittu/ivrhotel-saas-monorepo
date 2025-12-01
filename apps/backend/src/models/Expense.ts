import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    hotelId: mongoose.Types.ObjectId;
    category: 'UTILITIES' | 'INVENTORY' | 'MAINTENANCE' | 'SALARY' | 'OTHER';
    amount: number;
    description: string;
    date: Date;
    paidBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        category: { type: String, enum: ['UTILITIES', 'INVENTORY', 'MAINTENANCE', 'SALARY', 'OTHER'], required: true },
        amount: { type: Number, required: true, min: 0 },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
        paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
