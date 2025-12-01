import { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { z } from 'zod';
import { upload, getFileUrl, deleteFile } from '../services/upload.service';

// Validation schemas
const onboardingDataSchema = z.object({
    // Basic Info
    name: z.string().min(2).optional(),
    hotelType: z.enum(['LODGING', 'NORMAL', 'PREMIUM', 'LUXE', 'PREMIUM_LUXE']).optional(),
    handlingType: z.enum(['ROOMS', 'ROOMS_KITCHEN', 'ROOMS_RESTAURANT_KITCHEN', 'FULL']).optional(),
    safetyRating: z.string().optional(),

    // Contact
    contactNumber: z.string().optional(),
    email: z.string().email().optional(),

    // Location
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
        coordinates: z.object({
            lat: z.number().optional(),
            lng: z.number().optional()
        }).optional()
    }).optional(),
    legalAddress: z.string().optional(),

    // Legal
    gstNumber: z.string().optional(),
    authorizedSignatory: z.object({
        name: z.string(),
        phone: z.string(),
        signature: z.string().optional()
    }).optional(),
    businessStructure: z.enum(['PRIVATE_LIMITED', 'LLP', 'INDIVIDUAL']).optional()
});

/**
 * Update hotel onboarding data (draft mode)
 */
export const updateOnboardingData = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const data = onboardingDataSchema.parse(req.body);

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Update hotel fields
        Object.assign(hotel, data);
        await hotel.save();

        res.json(hotel);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error updating onboarding data', error });
    }
};

/**
 * Upload document
 */
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { documentType, category } = req.body; // e.g., documentType: 'gstCertificate', category: 'documents'

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const fileUrl = getFileUrl(req.file.path);

        // Update document in hotel based on type
        if (category === 'photos') {
            // Add to photos array
            const photoCategory = documentType; // 'lobby', 'rooms', etc.
            if (!hotel.photos[photoCategory as keyof typeof hotel.photos]) {
                hotel.photos[photoCategory as keyof typeof hotel.photos] = [];
            }
            hotel.photos[photoCategory as keyof typeof hotel.photos].push(fileUrl);
        } else if (category === 'branding') {
            // Logo or signature
            if (documentType === 'logo') {
                hotel.logo = fileUrl;
            } else if (documentType === 'signature') {
                hotel.authorizedSignatory.signature = fileUrl;
            }
        } else {
            // Legal documents
            const docPath = documentType.split('.');
            let target: any = hotel.documents;

            for (let i = 0; i < docPath.length - 1; i++) {
                if (!target[docPath[i]]) {
                    target[docPath[i]] = {};
                }
                target = target[docPath[i]];
            }

            target[docPath[docPath.length - 1]] = {
                url: fileUrl,
                status: 'pending'
            };
        }

        await hotel.save();

        res.json({
            success: true,
            url: fileUrl,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file', error });
    }
};

/**
 * Submit onboarding for review
 */
export const submitOnboarding = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Validate required fields are filled
        // TODO: Add comprehensive validation

        hotel.onboardingStatus = 'submitted';
        hotel.submittedAt = new Date();
        await hotel.save();

        res.json({
            success: true,
            message: 'Onboarding submitted for review',
            hotel
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting onboarding', error });
    }
};

/**
 * Get onboarding status
 */
export const getOnboardingStatus = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Calculate completion percentage
        let totalFields = 0;
        let completedFields = 0;

        // Basic info
        if (hotel.name) completedFields++;
        totalFields++;
        if (hotel.hotelType) completedFields++;
        totalFields++;
        if (hotel.handlingType) completedFields++;
        totalFields++;

        // Add more field checks...

        const completionPercentage = Math.round((completedFields / totalFields) * 100);

        res.json({
            onboardingStatus: hotel.onboardingStatus,
            completionPercentage,
            submittedAt: hotel.submittedAt,
            approvedAt: hotel.approvedAt,
            documents: hotel.documents,
            photos: hotel.photos
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching onboarding status', error });
    }
};

/**
 * Verify document (Super Admin)
 */
export const verifyDocument = async (req: Request, res: Response) => {
    try {
        const { hotelId, documentType } = req.params;
        const { status, comments } = req.body; // status: 'approved' | 'rejected' | 'reupload_requested'
        const verifiedBy = req.user?.id; // From auth middleware

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Navigate to document
        const docPath = documentType.split('.');
        let target: any = hotel.documents;

        for (const key of docPath) {
            if (!target[key]) {
                return res.status(404).json({ message: 'Document not found' });
            }
            target = target[key];
        }

        // Update verification status
        target.status = status;
        target.comments = comments;
        target.verifiedBy = verifiedBy;
        target.verifiedAt = new Date();

        await hotel.save();

        res.json({
            success: true,
            message: `Document ${status}`,
            document: target
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying document', error });
    }
};

/**
 * Approve hotel and activate (Super Admin)
 */
export const approveHotel = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Check if all required documents are approved
        // TODO: Add comprehensive check

        hotel.onboardingStatus = 'approved';
        hotel.status = 'ACTIVE';
        hotel.approvedAt = new Date();

        await hotel.save();

        // TODO: Send activation email to hotel admin

        res.json({
            success: true,
            message: 'Hotel approved and activated',
            hotel
        });
    } catch (error) {
        res.status(500).json({ message: 'Error approving hotel', error });
    }
};

/**
 * Get hotels pending verification (Super Admin)
 */
export const getPendingHotels = async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find({
            onboardingStatus: { $in: ['submitted', 'under_review'] }
        })
            .populate('brandId')
            .sort({ submittedAt: -1 });

        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending hotels', error });
    }
};
