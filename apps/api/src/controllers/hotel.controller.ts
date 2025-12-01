import { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { User } from '../models/User';
import { z } from 'zod';

// Validation Schemas
const createHotelSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3),
    planId: z.string(),
    contactNumber: z.string(),
    email: z.string().email(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string(),
        zipCode: z.string(),
    }),
    authorizedSignatory: z.object({
        name: z.string(),
        phone: z.string(),
        signature: z.string().optional()
    }),
    hotelType: z.string(),
    handlingType: z.string(),
});

export const createHotel = async (req: Request, res: Response) => {
    try {
        const validatedData = createHotelSchema.parse(req.body);
        const user = (req as any).user;
        const session = (req as any).session;

        // Check if slug exists
        const existingHotel = await Hotel.findOne({ slug: validatedData.slug });
        if (existingHotel) {
            return res.status(400).json({ message: 'Hotel with this slug already exists' });
        }

        // Get active organization from session or request
        // Assuming better-auth puts activeOrganizationId in session or we use the first one
        // For now, let's assume the user MUST be in an organization context to create a hotel
        // OR we create a new organization for this hotel?
        // The requirement says "Link to better-auth Organization".
        // Let's assume the user passes organizationId or we use the one from session.

        let organizationId = req.body.organizationId;
        if (!organizationId && session.activeOrganizationId) {
            organizationId = session.activeOrganizationId;
        }

        // If no organization, maybe we should fail or create one?
        // For now, let's make it optional but recommended.

        const hotel = new Hotel({
            ...validatedData,
            organizationId,
            status: 'PENDING',
        });

        await hotel.save();

        res.status(201).json(hotel);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

export const getHotels = async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

export const getHotel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id).populate('planId').populate('brandId');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
