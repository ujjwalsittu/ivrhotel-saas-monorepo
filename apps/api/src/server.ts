import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { resolveTenant } from './middleware/tenant.middleware';
import configRoutes from './routes/config.routes';

// Route imports
import hotelRoutes from './routes/hotel.routes';
import roomRoutes from './routes/room.routes';
import staffRoutes from './routes/staff.routes';
import bookingRoutes from './routes/booking.routes';
import planRoutes from './routes/plan.routes';
import brandRoutes from './routes/brand.routes';
import dashboardRoutes from './routes/dashboard.routes';
import posRoutes from './routes/pos.routes';
import housekeepingRoutes from './routes/housekeeping.routes';
import inventoryRoutes from './routes/inventory.routes';
import channelRoutes from './routes/channel.routes';
import { requireAuth, requireHotel } from './middleware/tenant';
import invoiceRoutes from './routes/invoice.routes';
import financeRoutes from './routes/finance.routes';
import onboardingRoutes from './routes/onboarding.routes';
import kycRoutes from './routes/kyc.routes';
import paymentRoutes from './routes/payment.routes';
import crmRoutes from './routes/crm.routes';
import healthRoutes from './routes/health.routes';
import analyticsRoutes from './routes/analytics.routes';
import websiteRoutes from './routes/website.routes';
import kioskRoutes from './routes/kiosk.routes';
import reportsRoutes from './routes/reports.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Better Auth handler
app.all("/api/auth/*", toNodeHandler(auth.handler));

// Apply tenant resolution middleware globally
app.use(resolveTenant);

// Health check routes (public)
app.use('/health', healthRoutes);

app.use('/api/config', configRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:hotelId', roomRoutes);
app.use('/api/hotels/:hotelId/staff', staffRoutes);
app.use('/api/hotels/:hotelId/bookings', bookingRoutes);
app.use('/api/hotels/:hotelId/dashboard', dashboardRoutes);
app.use('/api/hotels/:hotelId/pos', requireAuth, requireHotel(), posRoutes);
app.use('/api/hotels/:hotelId/housekeeping', requireAuth, requireHotel(), housekeepingRoutes);
app.use('/api/hotels/:hotelId/inventory', requireAuth, requireHotel(), inventoryRoutes);
app.use('/api/hotels/:hotelId/channels', requireAuth, requireHotel(), channelRoutes);
app.use('/api/hotels/:hotelId/invoices', invoiceRoutes);
app.use('/api/hotels/:hotelId/finance', financeRoutes);
app.use('/api/hotels/:hotelId/crm', crmRoutes);
app.use('/api/hotels/:hotelId/analytics', analyticsRoutes); // Analytics routes
app.use('/api', websiteRoutes); // Website routes have their own structure
app.use('/api/kiosk', kioskRoutes);
app.use('/api/hotels/:hotelId/reports', reportsRoutes); // Reports routes
app.use('/api/hotels', onboardingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/brands', brandRoutes);

// Static Files
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
