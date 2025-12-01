import { Request, Response } from 'express';
import { ChannelMapping } from '../models/ChannelMapping';
import { Booking } from '../models/Booking';
import { RoomType } from '../models/RoomType';
import * as emailParser from '../services/channel/email-parser.service';
import { z } from 'zod';

/**
 * Create OTA channel mapping
 */
export const createChannelMapping = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const mappingSchema = z.object({
            ota: z.enum(['MAKEMYTRIP', 'GOIBIBO', 'BOOKING_COM', 'AIRBNB', 'OYO', 'AGODA', 'EXPEDIA', 'OTHER']),
            email: z.string().email(),
            roomMappings: z.array(z.object({
                internalRoomTypeId: z.string(),
                otaRoomName: z.string(),
                otaRoomCode: z.string().optional()
            })),
            autoImport: z.boolean().default(true)
        });

        const data = mappingSchema.parse(req.body);

        // Check if mapping already exists
        const existing = await ChannelMapping.findOne({ hotelId, ota: data.ota });
        if (existing) {
            return res.status(400).json({ message: 'Channel mapping already exists for this OTA' });
        }

        const mapping = new ChannelMapping({
            hotelId,
            ...data
        });

        await mapping.save();

        res.status(201).json(mapping);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating channel mapping', error });
    }
};

/**
 * Get all channel mappings for a hotel
 */
export const getChannelMappings = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const mappings = await ChannelMapping.find({ hotelId })
            .populate('roomMappings.internalRoomTypeId');

        res.json(mappings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching channel mappings', error });
    }
};

/**
 * Update channel mapping
 */
export const updateChannelMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const mapping = await ChannelMapping.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );

        if (!mapping) {
            return res.status(404).json({ message: 'Channel mapping not found' });
        }

        res.json(mapping);
    } catch (error) {
        res.status(500).json({ message: 'Error updating channel mapping', error });
    }
};

/**
 * Parse booking email and create booking
 */
export const parseAndImportEmail = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { emailContent, emailSubject, fromAddress } = req.body;

        if (!emailContent || !emailSubject || !fromAddress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Parse email
        const result = await emailParser.parseBookingEmail(emailContent, emailSubject, fromAddress);

        if (!result.success || !result.booking) {
            return res.status(400).json({ message: result.error || 'Failed to parse email' });
        }

        const parsedBooking = result.booking;

        // Validate
        if (!emailParser.validateParsedBooking(parsedBooking)) {
            return res.status(400).json({ message: 'Invalid booking data extracted' });
        }

        // Find channel mapping
        const mapping = await ChannelMapping.findOne({
            hotelId,
            ota: parsedBooking.ota
        });

        if (!mapping) {
            return res.status(404).json({
                message: 'No channel mapping found for this OTA',
                parsedData: parsedBooking
            });
        }

        // Map room type
        const roomTypeId = mapping.mapRoom(parsedBooking.roomType);
        if (!roomTypeId) {
            return res.status(400).json({
                message: 'Room type not mapped',
                parsedData: parsedBooking,
                unmappedRoomType: parsedBooking.roomType
            });
        }

        // Check for duplicate
        const existingBooking = await Booking.findOne({
            hotelId,
            'metadata.otaBookingId': parsedBooking.bookingId
        });

        if (existingBooking) {
            return res.status(409).json({
                message: 'Booking already exists',
                bookingId: existingBooking._id
            });
        }

        // Create booking if autoImport is enabled
        if (mapping.autoImport) {
            const booking = new Booking({
                hotelId,
                guestName: parsedBooking.guestName,
                guestEmail: parsedBooking.guestEmail,
                guestPhone: parsedBooking.guestPhone,
                checkInDate: new Date(parsedBooking.checkInDate),
                checkOutDate: new Date(parsedBooking.checkOutDate),
                roomTypeId,
                numberOfGuests: parsedBooking.numberOfGuests || 1,
                totalPrice: parsedBooking.totalPrice,
                status: 'CONFIRMED',
                source: parsedBooking.ota,
                metadata: {
                    otaBookingId: parsedBooking.bookingId,
                    otaRoomType: parsedBooking.roomType,
                    specialRequests: parsedBooking.specialRequests
                }
            });

            await booking.save();

            // Update mapping stats
            mapping.totalBookings += 1;
            mapping.lastSyncedAt = new Date();
            await mapping.save();

            res.json({
                success: true,
                message: 'Booking created successfully',
                booking,
                parsedData: parsedBooking
            });
        } else {
            // Return parsed data for manual review
            res.json({
                success: true,
                message: 'Booking data parsed (auto-import disabled)',
                parsedData: parsedBooking,
                suggestedRoomTypeId: roomTypeId
            });
        }
    } catch (error) {
        console.error('Parse email error:', error);
        res.status(500).json({ message: 'Error parsing email', error });
    }
};

/**
 * Get OTA bookings
 */
export const getOTABookings = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { ota, startDate, endDate } = req.query;

        const filter: any = { hotelId };

        if (ota) {
            filter.source = ota;
        }

        if (startDate || endDate) {
            filter.checkInDate = {};
            if (startDate) filter.checkInDate.$gte = new Date(startDate as string);
            if (endDate) filter.checkInDate.$lte = new Date(endDate as string);
        }

        const bookings = await Booking.find(filter)
            .populate('roomTypeId')
            .sort({ checkInDate: -1 })
            .limit(100);

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching OTA bookings', error });
    }
};

/**
 * Sync availability to OTA (placeholder)
 */
export const syncAvailability = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { ota, startDate, endDate } = req.body;

        // TODO: Implement actual OTA API integration
        // For now, just return success

        res.json({
            success: true,
            message: 'Availability sync queued',
            details: {
                ota,
                dateRange: { startDate, endDate },
                note: 'OTA API integration pending'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error syncing availability', error });
    }
};
