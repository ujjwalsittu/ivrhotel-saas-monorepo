import { Router } from 'express';
import { getDailySalesReport, getOccupancyReport, exportReportCSV } from '../controllers/reports.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/sales', requireAuth, getDailySalesReport);
router.get('/occupancy', requireAuth, getOccupancyReport);
router.get('/export', requireAuth, exportReportCSV);

export default router;
