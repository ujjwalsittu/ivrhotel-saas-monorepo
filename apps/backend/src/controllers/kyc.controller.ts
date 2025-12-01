import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { KYCSession } from '../models/KYCSession';
import { Booking } from '../models/Booking';
import { z } from 'zod';
import { upload, getFileUrl } from '../services/upload.service';
import { verifyWithDigilocker } from '../services/digilocker.service';
import { compareFaces } from '../services/facematch.service';

/**
 * Generate KYC link for a booking
 */
export const generateKYCLink = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if KYC session already exists
        let kycSession = await KYCSession.findOne({ bookingId, status: { $ne: 'failed' } });

        if (!kycSession || kycSession.isExpired()) {
            // Generate new session
            const token = uuidv4();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

            kycSession = new KYCSession({
                bookingId,
                linkToken: token,
                expiresAt,
                auditLog: [{
                    timestamp: new Date(),
                    action: 'kyc_link_generated',
                    data: { bookingId },
                    ipAddress: req.ip
                }]
            });

            await kycSession.save();
        }

        const kycLink = `${process.env.FRONTEND_URL}/kyc/${kycSession.linkToken}`;

        res.json({
            success: true,
            kycLink,
            token: kycSession.linkToken,
            expiresAt: kycSession.expiresAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating KYC link', error });
    }
};

/**
 * Get KYC session by token (guest-facing)
 */
export const getKYCSession = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const session = await KYCSession.findOne({ linkToken: token })
            .populate('bookingId');

        if (!session) {
            return res.status(404).json({ message: 'Invalid KYC link' });
        }

        if (session.isExpired()) {
            return res.status(410).json({ message: 'KYC link has expired' });
        }

        if (session.attempts >= session.maxAttempts) {
            return res.status(403).json({ message: 'Maximum attempts exceeded' });
        }

        res.json({
            session: {
                bookingId: session.bookingId,
                status: session.status,
                step: session.step,
                nationality: session.nationality,
                documentType: session.documentType,
                expiresAt: session.expiresAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching KYC session', error });
    }
};

/**
 * Submit identity information
 */
const identitySchema = z.object({
    nationality: z.string(),
    documentType: z.enum(['aadhaar', 'passport', 'driving_license'])
});

export const submitIdentity = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const data = identitySchema.parse(req.body);

        const session = await KYCSession.findOne({ linkToken: token });
        if (!session || session.isExpired()) {
            return res.status(404).json({ message: 'Invalid or expired KYC session' });
        }

        session.nationality = data.nationality;
        session.documentType = data.documentType;
        session.status = 'in_progress';
        session.step = 'selfie';

        session.addAuditLog('identity_submitted', data, req.ip);

        await session.save();

        res.json({ success: true, nextStep: 'selfie' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error submitting identity', error });
    }
};

/**
 * Verify with Digilocker (dummy)
 */
export const verifyDigilocker = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { aadhaarNumber } = req.body;

        const session = await KYCSession.findOne({ linkToken: token });
        if (!session || session.isExpired()) {
            return res.status(404).json({ message: 'Invalid or expired KYC session' });
        }

        // Call dummy Digilocker service
        const digilockerResult = await verifyWithDigilocker(aadhaarNumber);

        if (!digilockerResult.success) {
            session.incrementAttempt();
            await session.save();
            return res.status(400).json({ message: digilockerResult.error });
        }

        // Save Digilocker data
        session.documentData = {
            documentNumber: digilockerResult.data!.documentNumber,
            name: digilockerResult.data!.name,
            dob: new Date(digilockerResult.data!.dob),
            address: digilockerResult.data!.address,
            documentImage: digilockerResult.data!.documentImage,
            digilockerResponse: digilockerResult.data
        };

        session.step = 'selfie';
        session.verifiedBy = 'digilocker';

        session.addAuditLog('digilocker_verified', { aadhaarNumber: 'XXXX-XXXX-' + aadhaarNumber.slice(-4) }, req.ip);

        await session.save();

        res.json({
            success: true,
            data: digilockerResult.data,
            nextStep: 'selfie'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying with Digilocker', error });
    }
};

/**
 * Upload document (for non-Digilocker flow)
 */
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const session = await KYCSession.findOne({ linkToken: token });
        if (!session || session.isExpired()) {
            return res.status(404).json({ message: 'Invalid or expired KYC session' });
        }

        const fileUrl = getFileUrl(req.file.path);

        session.documentData = {
            ...session.documentData,
            documentImage: fileUrl
        };

        session.step = 'selfie';
        session.addAuditLog('document_uploaded', { fileUrl }, req.ip);

        await session.save();

        res.json({ success: true, url: fileUrl, nextStep: 'selfie' });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading document', error });
    }
};

/**
 * Upload selfie
 */
export const uploadSelfie = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const session = await KYCSession.findOne({ linkToken: token });
        if (!session || session.isExpired()) {
            return res.status(404).json({ message: 'Invalid or expired KYC session' });
        }

        const fileUrl = getFileUrl(req.file.path);

        session.selfieImage = fileUrl;
        session.step = 'face_match';
        session.addAuditLog('selfie_uploaded', { fileUrl }, req.ip);

        await session.save();

        // Trigger face match
        if (session.documentData.documentImage) {
            const faceMatchResult = await compareFaces(
                session.documentData.documentImage,
                fileUrl
            );

            session.faceMatchScore = faceMatchResult.score;
            session.faceMatchResult = faceMatchResult.result;
            session.step = 'review';

            session.addAuditLog('face_match_completed', faceMatchResult, req.ip);

            await session.save();

            res.json({
                success: true,
                faceMatchScore: faceMatchResult.score,
                faceMatchResult: faceMatchResult.result,
                nextStep: 'review'
            });
        } else {
            res.json({ success: true, nextStep: 'review' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading selfie', error });
    }
};

/**
 * Complete KYC
 */
export const completeKYC = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const session = await KYCSession.findOne({ linkToken: token });
        if (!session || session.isExpired()) {
            return res.status(404).json({ message: 'Invalid or expired KYC session' });
        }

        // Validate all required data is present
        if (!session.documentData.documentNumber || !session.selfieImage) {
            return res.status(400).json({ message: 'Incomplete KYC data' });
        }

        session.status = 'completed';
        session.step = 'completed';
        session.verifiedAt = new Date();

        if (!session.verifiedBy) {
            session.verifiedBy = 'system';
        }

        session.addAuditLog('kyc_completed', {}, req.ip);

        await session.save();

        res.json({
            success: true,
            message: 'KYC completed successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error completing KYC', error });
    }
};

/**
 * Get KYC status for hotel staff
 */
export const getKYCStatus = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;

        const sessions = await KYCSession.find({ bookingId })
            .sort({ createdAt: -1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching KYC status', error });
    }
};
