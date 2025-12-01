import { Router } from 'express';
import {
    generateKYCLink,
    getKYCSession,
    submitIdentity,
    verifyDigilocker,
    uploadDocument,
    uploadSelfie,
    completeKYC,
    getKYCStatus
} from '../controllers/kyc.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../services/upload.service';

const router = Router();

// Public routes (token-based auth - no requireAuth middleware)
router.get('/:token', getKYCSession);
router.put('/:token/identity', submitIdentity);
router.post('/:token/digilocker', verifyDigilocker);
router.post('/:token/upload-document', upload.single('file'), uploadDocument);
router.post('/:token/upload-selfie', upload.single('file'), uploadSelfie);
router.post('/:token/complete', completeKYC);

// Protected routes (hotel staff)
router.post('/bookings/:bookingId/generate', requireAuth, generateKYCLink);
router.get('/bookings/:bookingId/status', requireAuth, getKYCStatus);

export default router;
