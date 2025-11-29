import { Router } from 'express';
import { createHotel, getHotel, getHotels, updateHotelDocuments, verifyHotel } from '../controllers/hotel.controller';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', createHotel);
router.get('/', getHotels);
router.get('/:id', getHotel);
router.post('/:id/documents', upload.array('documents', 5), updateHotelDocuments);
router.post('/:id/verify', verifyHotel);

export default router;
