import { Router } from 'express';
import {
    createChannelMapping,
    getChannelMappings,
    updateChannelMapping,
    parseAndImportEmail,
    getOTABookings,
    syncAvailability
} from '../controllers/channel.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Channel mapping routes
router.post('/hotels/:hotelId/channels', requireAuth, createChannelMapping);
router.get('/hotels/:hotelId/channels', requireAuth, getChannelMappings);
router.put('/channels/:id', requireAuth, updateChannelMapping);

// Email parsing
router.post('/hotels/:hotelId/channels/parse-email', requireAuth, parseAndImportEmail);

// OTA bookings
router.get('/hotels/:hotelId/channels/bookings', requireAuth, getOTABookings);

// Availability sync
router.post('/hotels/:hotelId/channels/sync-availability', requireAuth, syncAvailability);

export default router;
