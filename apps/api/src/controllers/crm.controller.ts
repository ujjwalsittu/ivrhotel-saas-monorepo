import { Request, Response } from 'express';
import { MessageTemplate } from '../models/MessageTemplate';
import { Booking } from '../models/Booking';
import * as communicationService from '../services/communication.service';
import { z } from 'zod';

/**
 * Send message to guest
 */
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const messageSchema = z.object({
            to: z.string(),
            channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP']),
            templateId: z.string().optional(),
            subject: z.string().optional(),
            content: z.string(),
            variables: z.record(z.string()).optional()
        });

        const data = messageSchema.parse(req.body);

        // Replace variables if provided
        let content = data.content;
        if (data.variables) {
            content = communicationService.replaceVariables(content, data.variables);
        }

        // Send message
        const result = await communicationService.sendMessage({
            to: data.to,
            channel: data.channel,
            subject: data.subject,
            content,
            templateId: data.templateId
        });

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        res.json({
            success: true,
            messageId: result.messageId,
            message: 'Message sent successfully'
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error sending message', error });
    }
};

/**
 * Get guest communication timeline
 */
export const getGuestTimeline = async (req: Request, res: Response) => {
    try {
        const { hotelId, guestId } = req.params;

        // For MVP, return mock timeline
        // In production, store sent messages in a CommunicationLog collection
        const timeline = [
            {
                timestamp: new Date('2024-12-01'),
                channel: 'EMAIL',
                type: 'booking_confirmation',
                status: 'sent',
                content: 'Booking confirmation sent'
            },
            {
                timestamp: new Date('2024-12-05'),
                channel: 'WHATSAPP',
                type: 'check_in_reminder',
                status: 'delivered',
                content: 'Check-in reminder sent'
            }
        ];

        res.json(timeline);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timeline', error });
    }
};

/**
 * Create campaign
 */
export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const campaignSchema = z.object({
            name: z.string(),
            templateId: z.string(),
            channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP']),
            audience: z.enum(['all', 'checked_in', 'upcoming', 'past']),
            scheduledAt: z.string().optional()
        });

        const data = campaignSchema.parse(req.body);

        // Get template
        const template = await MessageTemplate.findById(data.templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Get audience
        let bookings;
        const now = new Date();

        switch (data.audience) {
            case 'checked_in':
                bookings = await Booking.find({
                    hotelId,
                    checkInDate: { $lte: now },
                    checkOutDate: { $gte: now },
                    status: 'CHECKED_IN'
                }).populate('guestId');
                break;

            case 'upcoming':
                bookings = await Booking.find({
                    hotelId,
                    checkInDate: { $gt: now },
                    status: 'CONFIRMED'
                }).populate('guestId');
                break;

            case 'past':
                bookings = await Booking.find({
                    hotelId,
                    checkOutDate: { $lt: now },
                    status: 'CHECKED_OUT'
                }).populate('guestId');
                break;

            default:
                bookings = await Booking.find({ hotelId }).populate('guestId');
        }

        // Send to all recipients
        const recipients = bookings
            .map(b => data.channel === 'EMAIL' ? b.guestEmail : b.guestPhone)
            .filter((val): val is string => !!val);

        if (recipients.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this audience' });
        }

        // Send bulk messages
        const result = await communicationService.sendBulkMessages(recipients, {
            channel: data.channel,
            content: template.content.body,
            subject: template.content.subject
        });

        res.json({
            success: true,
            campaign: {
                name: data.name,
                recipientCount: result.total,
                successful: result.successful,
                failed: result.failed
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating campaign', error });
    }
};

/**
 * Get message templates
 */
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const templates = await MessageTemplate.find({ hotelId, active: true });

        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error });
    }
};

/**
 * Create message template
 */
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const templateSchema = z.object({
            name: z.string(),
            type: z.enum(['booking_confirmation', 'check_in_reminder', 'payment_receipt', 'kyc_request', 'custom']),
            channels: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP'])),
            subject: z.string().optional(),
            body: z.string()
        });

        const data = templateSchema.parse(req.body);

        const template = new MessageTemplate({
            hotelId,
            name: data.name,
            type: data.type,
            channels: data.channels,
            content: {
                subject: data.subject,
                body: data.body
            }
        });

        await template.save();

        res.status(201).json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating template', error });
    }
};

/**
 * Get guest list for CRM
 */
export const getGuests = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { search, segment } = req.query;

        let filter: any = { hotelId };

        // Apply segment filter
        const now = new Date();
        if (segment === 'checked_in') {
            filter.checkInDate = { $lte: now };
            filter.checkOutDate = { $gte: now };
            filter.status = 'CHECKED_IN';
        } else if (segment === 'upcoming') {
            filter.checkInDate = { $gt: now };
        } else if (segment === 'past') {
            filter.checkOutDate = { $lt: now };
        }

        // Search filter
        if (search) {
            filter.$or = [
                { guestName: { $regex: search, $options: 'i' } },
                { guestEmail: { $regex: search, $options: 'i' } },
                { guestPhone: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(filter)
            .sort({ checkInDate: -1 })
            .limit(100);

        // Group by guest
        const guestsMap = new Map();
        bookings.forEach(booking => {
            const key = booking.guestEmail || booking.guestPhone;
            if (!guestsMap.has(key)) {
                guestsMap.set(key, {
                    name: booking.guestName,
                    email: booking.guestEmail,
                    phone: booking.guestPhone,
                    totalBookings: 0,
                    lastStay: booking.checkInDate
                });
            }
            guestsMap.get(key).totalBookings++;
        });

        const guests = Array.from(guestsMap.values());

        res.json(guests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guests', error });
    }
};
