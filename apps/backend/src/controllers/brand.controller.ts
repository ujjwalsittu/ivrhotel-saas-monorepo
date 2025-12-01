import { Request, Response } from 'express';
import { Brand } from '../models/Brand';
import { Hotel } from '../models/Hotel';
import { z } from 'zod';

const createBrandSchema = z.object({
    name: z.string().min(2),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    logo: z.string().url().optional(),
    description: z.string().optional(),
    planId: z.string().optional(),
    settings: z.object({
        branding: z.object({
            primaryColor: z.string().optional(),
            secondaryColor: z.string().optional(),
            accentColor: z.string().optional()
        }).optional(),
        policies: z.object({
            cancellation: z.object({
                freeCancellationHours: z.number().optional(),
                cancellationFeePercentage: z.number().optional()
            }).optional(),
            checkIn: z.object({
                defaultTime: z.string().optional(),
                earlyCheckInFee: z.number().optional()
            }).optional(),
            checkOut: z.object({
                defaultTime: z.string().optional(),
                lateCheckOutFee: z.number().optional()
            }).optional()
        }).optional()
    }).optional()
});

export const createBrand = async (req: Request, res: Response) => {
    try {
        const data = createBrandSchema.parse(req.body);

        // Check if slug already exists
        const existing = await Brand.findOne({ slug: data.slug });
        if (existing) {
            return res.status(400).json({ message: 'Slug already exists' });
        }

        const brand = new Brand(data);
        await brand.save();

        res.status(201).json(brand);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating brand', error });
    }
};

export const getBrands = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const brands = await Brand.find(query)
            .populate('planId')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Brand.countDocuments(query);

        res.json({
            data: brands,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands', error });
    }
};

export const getBrandById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id).populate('planId');
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brand', error });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = createBrandSchema.partial().parse(req.body);

        // If slug is being updated, check uniqueness
        if (data.slug) {
            const existing = await Brand.findOne({ slug: data.slug, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: 'Slug already exists' });
            }
        }

        const brand = await Brand.findByIdAndUpdate(id, data, { new: true });
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json(brand);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating brand', error });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if brand has hotels
        const hotelCount = await Hotel.countDocuments({ brandId: id });
        if (hotelCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete brand with existing hotels',
                hotelCount
            });
        }

        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting brand', error });
    }
};

export const getBrandHotels = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const hotels = await Hotel.find({ brandId: id })
            .sort({ createdAt: -1 });

        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brand hotels', error });
    }
};

export const getBrandStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const hotelCount = await Hotel.countDocuments({ brandId: id });
        const activeHotels = await Hotel.countDocuments({ brandId: id, status: 'ACTIVE' });

        res.json({
            totalHotels: hotelCount,
            activeHotels,
            pendingHotels: hotelCount - activeHotels
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brand stats', error });
    }
};
