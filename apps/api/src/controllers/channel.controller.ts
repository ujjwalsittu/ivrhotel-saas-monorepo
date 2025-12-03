import { Request, Response } from 'express';
import { ChannelMapping } from '../models/ChannelMapping';
import { z } from 'zod';

// --- Validation Schemas ---

const createChannelSchema = z.object({
    ota: z.enum(['MAKEMYTRIP', 'GOIBIBO', 'BOOKING_COM', 'AIRBNB', 'OYO', 'AGODA', 'EXPEDIA', 'OTHER']),
    email: z.string().email(),
    autoImport: z.boolean().default(true),
    roomMappings: z.array(z.object({
        internalRoomTypeId: z.string(),
        otaRoomName: z.string(),
        otaRoomCode: z.string().optional()
    })).optional()
});

// --- Controllers ---

export const createChannel = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const validatedData = createChannelSchema.parse(req.body);

        const channel = new ChannelMapping({ ...validatedData, hotelId });
        await channel.save();
        res.status(201).json(channel);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        if ((error as any).code === 11000) {
            return res.status(400).json({ message: 'Channel mapping for this OTA already exists' });
        }
        res.status(500).json({ message: 'Error creating channel mapping', error });
    }
};

export const getChannels = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const channels = await ChannelMapping.find({ hotelId });
        res.json(channels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching channels', error });
    }
};

export const parseEmail = async (req: Request, res: Response) => {
    try {
        const { emailContent, emailSubject, fromAddress } = req.body;

        // Mock Email Parsing Logic
        // In a real system, this would use regex or an AI service to extract data

        console.log('Parsing email from:', fromAddress);
        console.log('Subject:', emailSubject);

        // Simple mock extraction
        const guestNameMatch = emailContent.match(/Guest Name:\s*(.+)/i);
        const checkInMatch = emailContent.match(/Check-in:\s*(.+)/i);
        const checkOutMatch = emailContent.match(/Check-out:\s*(.+)/i);
        const roomTypeMatch = emailContent.match(/Room Type:\s*(.+)/i);

        const parsedData = {
            guestName: guestNameMatch ? guestNameMatch[1].trim() : 'Unknown Guest',
            checkIn: checkInMatch ? checkInMatch[1].trim() : new Date().toISOString(),
            checkOut: checkOutMatch ? checkOutMatch[1].trim() : new Date(Date.now() + 86400000).toISOString(),
            roomType: roomTypeMatch ? roomTypeMatch[1].trim() : 'Standard Room',
            bookingId: 'OTA-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        res.json({ success: true, parsedData });
    } catch (error) {
        res.status(500).json({ message: 'Error parsing email', error });
    }
};
