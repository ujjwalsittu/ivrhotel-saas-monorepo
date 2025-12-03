import { Request, Response } from 'express';
import { Amenity } from '../models/Amenity';
import { PropertyType } from '../models/PropertyType';

/**
 * Get all amenities
 */
export const getAmenities = async (req: Request, res: Response) => {
    try {
        const amenities = await Amenity.find({ isActive: true }).sort({ category: 1, name: 1 });
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching amenities', error });
    }
};

/**
 * Create amenity (Admin only)
 */
export const createAmenity = async (req: Request, res: Response) => {
    try {
        const amenity = new Amenity(req.body);
        await amenity.save();
        res.status(201).json(amenity);
    } catch (error) {
        res.status(500).json({ message: 'Error creating amenity', error });
    }
};

/**
 * Get all property types
 */
export const getPropertyTypes = async (req: Request, res: Response) => {
    try {
        const types = await PropertyType.find({ isActive: true }).sort({ name: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property types', error });
    }
};

/**
 * Create property type (Admin only)
 */
export const createPropertyType = async (req: Request, res: Response) => {
    try {
        const type = new PropertyType(req.body);
        await type.save();
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: 'Error creating property type', error });
    }
};
