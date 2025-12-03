import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Guest } from '../models/Guest';
import { z } from 'zod';
import { BookingActivity } from '../models/BookingActivity';

// Helper to log activity
const logActivity = async (bookingId: string, hotelId: string, action: string, details?: any, userId?: string) => {
    try {
        await BookingActivity.create({
            bookingId,
            hotelId,
            userId,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to log booking activity:', error);
    }
};

export const getKYCSession = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const booking = await Booking.findOne({ kycToken: token }).populate('guestId');

        if (!booking) {
            return res.status(404).json({ message: 'Invalid KYC link' });
        }

        // Check if link expired (optional logic, e.g., if checked out)
        if (booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED') {
            return res.status(410).json({ message: 'This booking is no longer active' });
        }

        res.json({
            session: {
                bookingId: booking._id,
                guest: booking.guestId,
                status: booking.kycStatus
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching KYC session', error });
    }
};

export const updateIdentity = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { nationality, documentType } = req.body;

        const booking = await Booking.findOne({ kycToken: token });
        if (!booking) return res.status(404).json({ message: 'Invalid token' });

        // Update Guest (Assuming guestId is populated or we fetch it)
        // Since we need to update guest, let's fetch guest directly or use booking.guestId
        const guest = await Guest.findById(booking.guestId);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        // Update guest details (basic structure for now)
        // We might want to store nationality in address or a new field if needed, 
        // but for now let's just assume we are preparing for document upload.
        // Actually, let's store these in the guest model if we had fields, 
        // or just proceed to next step.
        // The UI sends nationality and documentType.
        // Let's update the guest's idProof type.

        guest.idProof = {
            ...guest.idProof,
            type: documentType,
            number: '' // Will be filled later
        };
        await guest.save();

        booking.kycStatus = 'IN_PROGRESS';
        await booking.save();

        res.json({ message: 'Identity updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating identity', error });
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        // In a real app, we would handle file upload here (e.g., to S3/Cloudinary).
        // For this MVP, we'll assume the file is handled by middleware (multer) 
        // and we get a file path or we just mock the URL.
        // Since we don't have S3 setup, let's mock the URL.

        const booking = await Booking.findOne({ kycToken: token });
        if (!booking) return res.status(404).json({ message: 'Invalid token' });

        const guest = await Guest.findById(booking.guestId);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        // Mock URL
        const mockUrl = `https://fake-storage.com/docs/${guest._id}_doc.jpg`;

        guest.idProof = {
            ...guest.idProof,
            type: guest.idProof?.type || 'UNKNOWN',
            number: guest.idProof?.number || '',
            url: mockUrl
        };
        await guest.save();

        res.json({ message: 'Document uploaded', url: mockUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading document', error });
    }
};

export const uploadSelfie = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const booking = await Booking.findOne({ kycToken: token });
        if (!booking) return res.status(404).json({ message: 'Invalid token' });

        const guest = await Guest.findById(booking.guestId);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        // Mock URL
        const mockUrl = `https://fake-storage.com/selfies/${guest._id}_selfie.jpg`;

        guest.selfieUrl = mockUrl;
        await guest.save();

        // Mock Face Match Score
        const faceMatchScore = 98;

        res.json({ message: 'Selfie uploaded', url: mockUrl, faceMatchScore });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading selfie', error });
    }
};

export const completeKYC = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const booking = await Booking.findOne({ kycToken: token });
        if (!booking) return res.status(404).json({ message: 'Invalid token' });

        const guest = await Guest.findById(booking.guestId);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        booking.kycStatus = 'COMPLETED'; // Or VERIFIED if auto-verified
        await booking.save();

        guest.kycStatus = 'VERIFIED';
        await guest.save();

        await logActivity(booking._id as string, booking.hotelId.toString(), 'KYC_COMPLETED', { guestId: guest._id });

        res.json({ message: 'KYC Completed' });
    } catch (error) {
        res.status(500).json({ message: 'Error completing KYC', error });
    }
};

// Digilocker Mock
export const digilockerVerify = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { aadhaarNumber } = req.body;

        const booking = await Booking.findOne({ kycToken: token });
        if (!booking) return res.status(404).json({ message: 'Invalid token' });

        const guest = await Guest.findById(booking.guestId);
        if (!guest) return res.status(404).json({ message: 'Guest not found' });

        // Mock Verification
        guest.idProof = {
            type: 'AADHAAR',
            number: aadhaarNumber,
            url: 'https://digilocker.gov.in/mock-doc'
        };
        await guest.save();

        res.json({
            message: 'Verified',
            data: {
                name: guest.name, // Match guest name
                dob: '01-01-1990',
                gender: 'M'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying with Digilocker', error });
    }
};
