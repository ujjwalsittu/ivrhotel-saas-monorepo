#!/usr/bin/env ts-node

/**
 * Seed Script: Default Message Templates
 * 
 * Creates default message templates for hotels
 * 
 * Usage: ts-node scripts/seed-templates.ts <hotelId>
 */

import mongoose from 'mongoose';
import { MessageTemplate } from '../src/models/MessageTemplate';

const DEFAULT_TEMPLATES = [
    {
        name: 'Booking Confirmation',
        type: 'booking_confirmation',
        channels: ['EMAIL', 'WHATSAPP'],
        content: {
            subject: 'Booking Confirmed - {{hotelName}}',
            body: `Dear {{guestName}},

Thank you for choosing {{hotelName}}!

Your booking has been confirmed:
- Booking ID: {{bookingId}}
- Check-in: {{checkInDate}}
- Check-out: {{checkOutDate}}
- Room Type: {{roomType}}

We look forward to welcoming you!

Best regards,
{{hotelName}} Team`
        }
    },
    {
        name: 'Check-in Reminder',
        type: 'check_in_reminder',
        channels: ['EMAIL', 'SMS', 'WHATSAPP'],
        content: {
            subject: 'Check-in Tomorrow - {{hotelName}}',
            body: `Hi {{guestName}},

This is a reminder that you have a booking at {{hotelName}} tomorrow ({{checkInDate}}).

Check-in time: 2:00 PM
Check-out time: 11:00 AM

If you need early check-in or have any special requests, please let us know!

See you soon!
{{hotelName}}`
        }
    },
    {
        name: 'Payment Receipt',
        type: 'payment_receipt',
        channels: ['EMAIL'],
        content: {
            subject: 'Payment Receipt - {{hotelName}}',
            body: `Dear {{guestName}},

Thank you for your payment!

Receipt Details:
- Amount: ₹{{amount}}
- Payment Method: {{method}}
- Transaction ID: {{transactionId}}
- Date: {{date}}

This is your official receipt.

{{hotelName}}`
        }
    },
    {
        name: 'KYC Request',
        type: 'kyc_request',
        channels: ['EMAIL', 'SMS', 'WHATSAPP'],
        content: {
            subject: 'Complete Your KYC - {{hotelName}}',
            body: `Hi {{guestName}},

To complete your check-in at {{hotelName}}, please complete your KYC verification:

{{kycLink}}

This link expires in 7 days.

Thank you!
{{hotelName}}`
        }
    }
];

async function seedTemplates(hotelId: string) {
    try {
        console.log('🌱 Seeding default message templates\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivrhotel';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Validate hotelId
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            throw new Error('Invalid hotel ID');
        }

        let created = 0;
        let skipped = 0;

        for (const template of DEFAULT_TEMPLATES) {
            // Check if template already exists
            const existing = await MessageTemplate.findOne({
                hotelId,
                type: template.type
            });

            if (existing) {
                console.log(`⏭️  Skipped: ${template.name} (already exists)`);
                skipped++;
                continue;
            }

            // Create template
            await MessageTemplate.create({
                hotelId,
                ...template
            });

            console.log(`✅ Created: ${template.name}`);
            created++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${DEFAULT_TEMPLATES.length}`);

        console.log('\n✅ Seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Get hotelId from command line
const hotelId = process.argv[2];

if (!hotelId) {
    console.error('❌ Error: Please provide a hotel ID');
    console.log('Usage: ts-node scripts/seed-templates.ts <hotelId>');
    process.exit(1);
}

// Run seeding
seedTemplates(hotelId);
