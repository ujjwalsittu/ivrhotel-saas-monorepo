import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
import hotelRoutes from './routes/hotel.routes';
import roomRoutes from './routes/room.routes';
import staffRoutes from './routes/staff.routes';
import bookingRoutes from './routes/booking.routes';

app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:hotelId', roomRoutes);
app.use('/api/hotels/:hotelId/staff', staffRoutes);
app.use('/api/hotels/:hotelId/bookings', bookingRoutes);

// Static Files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ivrhotel';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
