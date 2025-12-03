import { Request, Response } from 'express';
import { InventoryItem } from '../models/InventoryItem';
import { InventoryTransaction } from '../models/InventoryTransaction';
import { z } from 'zod';

// --- Validation Schemas ---

const createItemSchema = z.object({
    name: z.string().min(2),
    category: z.enum(['HOUSEKEEPING', 'KITCHEN', 'OFFICE', 'MAINTENANCE', 'OTHER']),
    quantity: z.number().min(0),
    unit: z.string(),
    minStockLevel: z.number().min(0).default(10),
    costPrice: z.number().min(0).default(0),
});

const createTransactionSchema = z.object({
    itemId: z.string(),
    type: z.enum(['IN', 'OUT']),
    quantity: z.number().min(1),
    reason: z.string().optional(),
});

// --- Controllers ---

export const createItem = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createItemSchema.parse(req.body);

        const item = new InventoryItem({ ...validatedData, hotelId });
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        // Handle duplicate key error
        if ((error as any).code === 11000) {
            return res.status(400).json({ message: 'Item with this name already exists' });
        }
        res.status(500).json({ message: 'Error creating inventory item', error });
    }
};

export const getItems = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { category, lowStock } = req.query;

        const query: any = { hotelId };
        if (category) query.category = category;

        // If lowStock is true, find items where quantity <= minStockLevel
        if (lowStock === 'true') {
            query.$expr = { $lte: ["$quantity", "$minStockLevel"] };
        }

        const items = await InventoryItem.find(query).sort({ name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory items', error });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createItemSchema.partial().parse(req.body);

        const item = await InventoryItem.findByIdAndUpdate(id, validatedData, { new: true });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error updating inventory item', error });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await InventoryItem.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting inventory item', error });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createTransactionSchema.parse(req.body);
        const userId = (req as any).user?.id;

        const item = await InventoryItem.findOne({ _id: validatedData.itemId, hotelId });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check stock for OUT transaction
        if (validatedData.type === 'OUT' && item.quantity < validatedData.quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Create transaction record
        const transaction = new InventoryTransaction({
            hotelId,
            itemId: validatedData.itemId,
            type: validatedData.type,
            quantity: validatedData.quantity,
            reason: validatedData.reason,
            performedBy: userId
        });
        await transaction.save();

        // Update item quantity
        if (validatedData.type === 'IN') {
            item.quantity += validatedData.quantity;
        } else {
            item.quantity -= validatedData.quantity;
        }
        await item.save();

        res.status(201).json({ transaction, item });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error processing transaction', error });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { itemId, type } = req.query;

        const query: any = { hotelId };
        if (itemId) query.itemId = itemId;
        if (type) query.type = type;

        const transactions = await InventoryTransaction.find(query)
            .populate('itemId', 'name')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 transactions

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};
