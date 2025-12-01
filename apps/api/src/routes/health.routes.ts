import { Router } from 'express';
import { healthCheck, databaseHealth, detailedHealth } from '../controllers/health.controller';

const router = Router();

router.get('/', healthCheck);
router.get('/db', databaseHealth);
router.get('/detailed', detailedHealth);

export default router;
