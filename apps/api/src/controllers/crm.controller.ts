import { Request, Response } from 'express';
import { Guest } from '../models/Guest';
import { MessageTemplate } from '../models/MessageTemplate';
import { Campaign } from '../models/Campaign';
import { z } from 'zod';

// --- Validation Schemas ---

const createTemplateSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['TRANSACTIONAL', 'MARKETING']),
    channels: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP'])),
    content: z.object({
        subject: z.string().optional(),
        body: z.string().min(1)
    })
});

const createCampaignSchema = z.object({
    name: z.string().min(1),
    templateId: z.string(),
    segment: z.object({
        criteria: z.any()
    }),
    scheduledAt: z.string().optional() // ISO date string
});

// --- Controllers ---

export const getGuests = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        // In a real app, we would aggregate booking data to calculate total stays, etc.
        // For now, we'll just return guests associated with the hotel's bookings.
        // Since Guest model is global, we need to find guests who have bookings at this hotel.
        // This is a simplification.

        // Mocking guest stats for now as we don't have a direct link in Guest model to Hotel except via Bookings
        // We would typically do an aggregation on Bookings to find unique guests for this hotel.

        // For MVP, let's just fetch all guests (assuming single tenant or small scale) 
        // OR better, fetch guests who have a booking with this hotelId.

        // Let's use a simple find for now, but in production this needs to be optimized.
        const guests = await Guest.find().limit(50);

        // Enrich with mock stats
        const enrichedGuests = guests.map(g => ({
            ...g.toObject(),
            totalBookings: Math.floor(Math.random() * 5) + 1,
            lastStay: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
        }));

        res.json(enrichedGuests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guests', error });
    }
};

export const getGuestTimeline = async (req: Request, res: Response) => {
    try {
        const { guestId } = req.params;
        // Mock timeline
        const timeline = [
            { type: 'BOOKING', date: new Date().toISOString(), details: 'Booked Room 101' },
            { type: 'CHECK_IN', date: new Date().toISOString(), details: 'Checked in' },
            { type: 'EMAIL_SENT', date: new Date().toISOString(), details: 'Welcome Email' }
        ];
        res.json(timeline);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guest timeline', error });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { to, channel, subject, content } = req.body;

        // Mock sending message
        console.log(`Sending ${channel} to ${to}:`, { subject, content });

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const templates = await MessageTemplate.find({ hotelId });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createTemplateSchema.parse(req.body);

        const template = new MessageTemplate({ ...validatedData, hotelId });
        await template.save();
        res.status(201).json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating template', error });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createCampaignSchema.parse(req.body);

        const campaign = new Campaign({
            ...validatedData,
            hotelId,
            status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT'
        });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating campaign', error });
    }
};
