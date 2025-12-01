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
    authorizedSignatory: z.string(),
    hotelType: z.string(),
    handlingType: z.string(),
});

export const createHotel = async (req: Request, res: Response) => {
    try {
        const validatedData = createHotelSchema.parse(req.body);

        // Check if slug exists
        const existingHotel = await Hotel.findOne({ slug: validatedData.slug });
        if (existingHotel) {
            return res.status(400).json({ message: 'Hotel with this slug already exists' });
        }

        const hotel = new Hotel({
            ...validatedData,
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

export const updateHotelDocuments = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const documents = files.map(file => ({
            type: 'KYC', // Default type for now, can be passed in body
            url: `/uploads/${file.filename}`,
            verified: false
        }));

        const hotel = await Hotel.findByIdAndUpdate(
            id,
            { $push: { kycDocuments: { $each: documents } } },
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

export const verifyHotel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body; // status: 'ACTIVE' | 'REJECTED'

        if (!['ACTIVE', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const hotel = await Hotel.findByIdAndUpdate(
            id,
            { status, $push: { comments: { text: comments, date: new Date() } } }, // Assuming we add a comments field to schema later or just log it
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // TODO: Send email to hotel admin

        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
