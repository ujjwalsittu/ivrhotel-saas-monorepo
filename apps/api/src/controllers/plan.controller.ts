import { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { z } from 'zod';

const planSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().default('USD'),
    interval: z.enum(['MONTHLY', 'YEARLY']),
    modules: z.array(z.object({
        name: z.string(),
        enabled: z.boolean(),
        limits: z.any().optional(),
    })),
    isActive: z.boolean().default(true),
});

export const createPlan = async (req: Request, res: Response) => {
    try {
        const validatedData = planSchema.parse(req.body);
        const plan = new Plan(validatedData);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating plan', error });
    }
};

export const getPlans = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans', error });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = planSchema.partial().parse(req.body);
        const plan = await Plan.findByIdAndUpdate(id, validatedData, { new: true });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error updating plan', error });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByIdAndDelete(id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting plan', error });
    }
};
