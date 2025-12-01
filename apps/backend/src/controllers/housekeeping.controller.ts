import { Request, Response } from 'express';
import { HousekeepingTask } from '../models/HousekeepingTask';
import { Room } from '../models/Room';
import { z } from 'zod';

// --- Validation Schemas ---

const createTaskSchema = z.object({
    roomId: z.string(),
    type: z.enum(['CLEANING', 'MAINTENANCE']),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    assignedTo: z.string().optional(),
});

// --- Controllers ---

export const createTask = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createTaskSchema.parse(req.body);

        const task = new HousekeepingTask({ ...validatedData, hotelId });
        await task.save();

        // If it's a maintenance task, maybe mark room as MAINTENANCE?
        if (validatedData.type === 'MAINTENANCE') {
            await Room.findByIdAndUpdate(validatedData.roomId, { status: 'MAINTENANCE' });
        }

        res.status(201).json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating task', error });
    }
};

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { status, type, roomId } = req.query;

        const query: any = { hotelId };
        if (status) query.status = status;
        if (type) query.type = type;
        if (roomId) query.roomId = roomId;

        const tasks = await HousekeepingTask.find(query)
            .populate('roomId', 'number')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;

        const updates: any = {};
        if (status) updates.status = status;
        if (assignedTo) updates.assignedTo = assignedTo;

        const task = await HousekeepingTask.findByIdAndUpdate(id, updates, { new: true });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If task is completed
        if (status === 'COMPLETED') {
            if (task.type === 'CLEANING') {
                await Room.findByIdAndUpdate(task.roomId, { status: 'CLEAN' });
            } else if (task.type === 'MAINTENANCE') {
                // For maintenance, maybe we set it to DIRTY (needs cleaning after maintenance) or CLEAN?
                // Let's set to DIRTY so housekeeping checks it.
                await Room.findByIdAndUpdate(task.roomId, { status: 'DIRTY' });
            }
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};

export const getRoomStatusStats = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const clean = await Room.countDocuments({ hotelId, status: 'CLEAN' });
        const dirty = await Room.countDocuments({ hotelId, status: 'DIRTY' });
        const maintenance = await Room.countDocuments({ hotelId, status: 'MAINTENANCE' });
        const occupied = await Room.countDocuments({ hotelId, status: 'OCCUPIED' });

        res.json({ clean, dirty, maintenance, occupied });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room stats', error });
    }
};
