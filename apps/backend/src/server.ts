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

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

app.all("/api/auth/*", toNodeHandler(auth));

import planRoutes from './routes/plan.routes';
import brandRoutes from './routes/brand.routes';
import { resolveTenant } from './middleware/tenant.middleware';

import dashboardRoutes from './routes/dashboard.routes';
import posRoutes from './routes/pos.routes';
import housekeepingRoutes from './routes/housekeeping.routes';
import invoiceRoutes from './routes/invoice.routes';
import financeRoutes from './routes/finance.routes';
import onboardingRoutes from './routes/onboarding.routes';
import kycRoutes from './routes/kyc.routes';
import paymentRoutes from './routes/payment.routes';
import channelRoutes from './routes/channel.routes';
import crmRoutes from './routes/crm.routes';

// Apply tenant resolution middleware globally
app.use(resolveTenant);

app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:hotelId', roomRoutes);
app.use('/api/hotels/:hotelId/staff', staffRoutes);
app.use('/api/hotels/:hotelId/bookings', bookingRoutes);
app.use('/api/hotels/:hotelId/dashboard', dashboardRoutes);
app.use('/api/hotels/:hotelId/pos', posRoutes);
app.use('/api/hotels/:hotelId/housekeeping', housekeepingRoutes);
app.use('/api/hotels/:hotelId/invoices', invoiceRoutes);
app.use('/api/hotels/:hotelId/finance', financeRoutes);
app.use('/api/hotels/:hotelId/crm', crmRoutes); // CRM routes
app.use('/api/hotels', onboardingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/brands', brandRoutes);

// Static Files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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
