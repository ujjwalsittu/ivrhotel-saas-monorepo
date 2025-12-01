import { Router } from 'express';
import {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    getBrandHotels,
    getBrandStats
} from '../controllers/brand.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// All brand routes require Super Admin access
router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), createBrand);
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), getBrands);
router.get('/:id', requireAuth, requireRole(['SUPER_ADMIN']), getBrandById);
router.put('/:id', requireAuth, requireRole(['SUPER_ADMIN']), updateBrand);
router.delete('/:id', requireAuth, requireRole(['SUPER_ADMIN']), deleteBrand);
router.get('/:id/hotels', requireAuth, requireRole(['SUPER_ADMIN']), getBrandHotels);
router.get('/:id/stats', requireAuth, requireRole(['SUPER_ADMIN']), getBrandStats);

export default router;
