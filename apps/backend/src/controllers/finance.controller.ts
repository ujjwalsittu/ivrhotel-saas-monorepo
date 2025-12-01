import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { Payroll } from '../models/Payroll';
import { User } from '../models/User';

// --- Expense Controllers ---

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { category, amount, description, date } = req.body;
        // Assuming req.user is populated by auth middleware, but we need to cast it or use a custom interface
        // For now, let's assume we pass paidBy or get it from context. 
        // Since better-auth might not put full user object on req, we might need to fetch it or trust the ID.
        // Let's assume the auth middleware puts `user` or `session` on req.
        // For this implementation, I'll assume the frontend sends `paidBy` or we use a placeholder if not available.
        // Ideally, we get it from the authenticated user.

        // Temporary: use body.paidBy if provided (for testing), else fail or use a default if we had one.
        // In a real app, `req.user.id` from middleware.
        const paidBy = req.body.paidBy;

        const expense = new Expense({
            hotelId,
            category,
            amount,
            description,
            date: date || new Date(),
            paidBy
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense', error });
    }
};

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const expenses = await Expense.find({ hotelId })
            .populate('paidBy', 'name')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
};

export const getExpenseStats = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const stats = await Expense.aggregate([
            { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense stats', error });
    }
};

// --- Payroll Controllers ---

export const createPayroll = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { staffId, month, year, basicSalary, bonuses, deductions } = req.body;

        const netSalary = basicSalary + (bonuses || 0) - (deductions || 0);

        const payroll = new Payroll({
            hotelId,
            staffId,
            month,
            year,
            basicSalary,
            bonuses,
            deductions,
            netSalary
        });

        await payroll.save();
        res.status(201).json(payroll);
    } catch (error) {
        res.status(500).json({ message: 'Error creating payroll', error });
    }
};

export const getPayrolls = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { month, year } = req.query;

        const query: any = { hotelId };
        if (month) query.month = month;
        if (year) query.year = year;

        const payrolls = await Payroll.find(query)
            .populate('staffId', 'name email role')
            .sort({ year: -1, month: -1 });

        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payrolls', error });
    }
};

export const markPayrollPaid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findByIdAndUpdate(
            id,
            { status: 'PAID', paymentDate: new Date() },
            { new: true }
        );

        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

        // Automatically create an Expense for this salary payment
        const expense = new Expense({
            hotelId: payroll.hotelId,
            category: 'SALARY',
            amount: payroll.netSalary,
            description: `Salary for ${payroll.month}/${payroll.year}`,
            paidBy: req.body.paidBy, // Admin who clicked 'Pay'
            date: new Date()
        });
        await expense.save();

        res.json(payroll);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payroll', error });
    }
};

import mongoose from 'mongoose';
