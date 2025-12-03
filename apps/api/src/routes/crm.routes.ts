import { Router } from 'express';
import {
    sendMessage,
    getGuestTimeline,
    createCampaign,
    getTemplates,
    createTemplate,
    getGuests
} from '../controllers/crm.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

// Messaging
router.post('/send-message', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), sendMessage);

// Guest management
router.get('/guests', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getGuests);
router.get('/guests/:guestId/timeline', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK']), getGuestTimeline);

// Campaigns
router.post('/campaigns', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createCampaign);

// Templates
router.get('/templates', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getTemplates);
router.post('/templates', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createTemplate);

export default router;
