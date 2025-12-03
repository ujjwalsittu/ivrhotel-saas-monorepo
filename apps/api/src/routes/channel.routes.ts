import { Router } from 'express';
import { createChannel, getChannels, parseEmail } from '../controllers/channel.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), createChannel);
router.get('/', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), getChannels);
router.post('/parse-email', requireAuth, requireRole(['HOTEL_ADMIN', 'MANAGER']), parseEmail);

export default router;
