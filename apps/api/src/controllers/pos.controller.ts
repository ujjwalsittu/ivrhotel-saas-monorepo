import { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { z } from 'zod';

// --- Validation Schemas ---

const createMenuItemSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().min(0),
    category: z.enum(['FOOD', 'BEVERAGE', 'SERVICE', 'OTHER']),
    imageUrl: z.string().optional(),
    isAvailable: z.boolean().default(true),
});

const createOrderSchema = z.object({
    roomId: z.string().optional(),
    guestId: z.string().optional(),
    tableNumber: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().min(1),
    })).min(1),
});

// --- Menu Item Controllers ---

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createMenuItemSchema.parse(req.body);

        const menuItem = new MenuItem({ ...validatedData, hotelId });
        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating menu item', error });
    }
};

export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { category, search } = req.query;

        const query: any = { hotelId };
        if (category) query.category = category;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = createMenuItemSchema.partial().parse(req.body);

        const menuItem = await MenuItem.findByIdAndUpdate(id, validatedData, { new: true });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findByIdAndDelete(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
};

// --- Order Controllers ---

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createOrderSchema.parse(req.body);

        // Fetch menu items to calculate price and validate existence
        const menuItemIds = validatedData.items.map(item => item.menuItemId);
        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, hotelId });

        if (menuItems.length !== menuItemIds.length) {
            return res.status(400).json({ message: 'One or more menu items not found' });
        }

        let totalAmount = 0;
        const orderItems = validatedData.items.map(item => {
            const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);
            if (!menuItem) throw new Error('Menu item not found'); // Should not happen due to check above

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            return {
                menuItemId: menuItem._id,
                name: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            };
        });

        const order = new Order({
            hotelId,
            roomId: validatedData.roomId,
            guestId: validatedData.guestId,
            tableNumber: validatedData.tableNumber,
            notes: validatedData.notes,
            items: orderItems,
            totalAmount,
            status: 'PENDING',
            paymentStatus: 'PENDING'
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating order', error });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { status, roomId } = req.query;

        const query: any = { hotelId };
        if (status) query.status = status;
        if (roomId) query.roomId = roomId;

        const orders = await Order.find(query)
            .populate('roomId', 'number')
            .populate('guestId', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const updates: any = {};
        if (status) updates.status = status;
        if (paymentStatus) updates.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(id, updates, { new: true })
            .populate('roomId', 'number')
            .populate('guestId', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
