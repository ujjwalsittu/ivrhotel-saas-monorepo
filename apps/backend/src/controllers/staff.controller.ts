import { Request, Response } from 'express';
import { User } from '../models/User';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createStaffSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']),
    permissions: z.array(z.string()).optional(),
});

export const createStaff = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createStaffSchema.parse(req.body);

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const staff = new User({
            ...validatedData,
            password: hashedPassword,
            hotelId,
        });

        await staff.save();

        // Exclude password from response
        const { password, ...staffData } = staff.toObject();
        res.status(201).json(staffData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating staff', error });
    }
};

export const getStaff = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const staff = await User.find({ hotelId }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error });
    }
};

export const updateStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createStaffSchema.partial().parse(req.body);

        // If password is being updated, hash it
        if (validatedData.password) {
            validatedData.password = await bcrypt.hash(validatedData.password, 10);
        }

        const staff = await User.findByIdAndUpdate(id, validatedData, { new: true }).select('-password');
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error updating staff', error });
    }
};

export const deleteStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const staff = await User.findByIdAndDelete(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting staff', error });
    }
};
