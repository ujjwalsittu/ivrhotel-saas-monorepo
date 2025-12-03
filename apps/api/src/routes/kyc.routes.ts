import { Router } from 'express';
import {
    getKYCSession,
    updateIdentity,
    uploadDocument,
    uploadSelfie,
    completeKYC,
    digilockerVerify
} from '../controllers/kyc.controller';

const router = Router();

// Public routes (protected by token in URL)
router.get('/:token', getKYCSession);
router.put('/:token/identity', updateIdentity);
router.post('/:token/upload-document', uploadDocument); // Add multer middleware here in real app
router.post('/:token/upload-selfie', uploadSelfie);     // Add multer middleware here in real app
router.post('/:token/complete', completeKYC);
router.post('/:token/digilocker', digilockerVerify);

export default router;
