import { Router } from 'express';
import {
    sendMessage,
    getGuestTimeline,
    createCampaign,
    getTemplates,
    createTemplate,
    getGuests
} from '../controllers/crm.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Messaging
router.post('/send-message', requireAuth, sendMessage);

// Guest management
router.get('/guests', requireAuth, getGuests);
router.get('/guests/:guestId/timeline', requireAuth, getGuestTimeline);

// Campaigns
router.post('/campaigns', requireAuth, createCampaign);

// Templates
router.get('/templates', requireAuth, getTemplates);
router.post('/templates', requireAuth, createTemplate);

export default router;
