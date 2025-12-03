import { Request, Response } from 'express';
import { WebsiteConfig } from '../models/WebsiteConfig';
import { Hotel } from '../models/Hotel';
import { z } from 'zod';

const updateConfigSchema = z.object({
    domain: z.string().optional(),
    slug: z.string().min(1),
    theme: z.object({
        primaryColor: z.string(),
        secondaryColor: z.string(),
        font: z.string()
    }),
    content: z.object({
        heroImage: z.string().optional(),
        aboutText: z.string().optional(),
        contactEmail: z.string().email().optional()
    })
});

import { cacheService } from '../services/cache.service';

export const getPublicConfig = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.params;
        const cacheKey = `website:config:${identifier}`;

        // Try cache first
        const cachedConfig = await cacheService.get(cacheKey);
        if (cachedConfig) {
            return res.json(cachedConfig);
        }

        // Try to find by slug first, then domain
        let config = await WebsiteConfig.findOne({ slug: identifier });
        if (!config) {
            config = await WebsiteConfig.findOne({ domain: identifier });
        }

        if (!config) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Cache for 1 hour
        await cacheService.set(cacheKey, config, 3600);

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching website config', error });
    }
};

export const getWebsiteConfig = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        let config = await WebsiteConfig.findOne({ hotelId });

        if (!config) {
            // Create default config if not exists
            const hotel = await Hotel.findById(hotelId);
            if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

            config = new WebsiteConfig({
                hotelId,
                slug: hotel.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                theme: {
                    primaryColor: '#0f172a',
                    secondaryColor: '#ffffff',
                    font: 'Inter'
                },
                content: {
                    aboutText: `Welcome to ${hotel.name}`
                }
            });
            await config.save();
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching website config', error });
    }
};

export const updateWebsiteConfig = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = updateConfigSchema.parse(req.body);

        const config = await WebsiteConfig.findOneAndUpdate(
            { hotelId },
            { $set: validatedData },
            { new: true, upsert: true }
        );

        // Invalidate cache
        if (config) {
            await cacheService.del(`website:config:${config.slug}`);
            if (config.domain) {
                await cacheService.del(`website:config:${config.domain}`);
            }
        }

        res.json(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating website config', error });
    }
};
