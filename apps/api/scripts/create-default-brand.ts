#!/usr/bin/env ts-node

/**
 * Migration Script: Create Default Brand
 * 
 * Creates an "Independent Hotels" brand for existing hotels without brandId
 * 
 * Usage: ts-node scripts/create-default-brand.ts
 */

import mongoose from 'mongoose';
import { Brand } from '../src/models/Brand';
import { Hotel } from '../src/models/Hotel';

async function migrate() {
    try {
        console.log('🔄 Starting migration: Create Default Brand\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivrhotel';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if default brand already exists
        let defaultBrand = await Brand.findOne({ slug: 'independent-hotels' });

        if (!defaultBrand) {
            // Create default brand
            defaultBrand = new Brand({
                name: 'Independent Hotels',
                slug: 'independent-hotels',
                description: 'Default brand for independent hotels',
                logo: '',
                website: '',
                settings: {
                    branding: {
                        primaryColor: '#3b82f6',
                        secondaryColor: '#1e40af'
                    }
                }
            });

            await defaultBrand.save();
            console.log('✅ Created default brand:', defaultBrand.name);
        } else {
            console.log('ℹ️  Default brand already exists');
        }

        // Find hotels without brandId
        const hotelsWithoutBrand = await Hotel.find({ brandId: { $exists: false } });
        console.log(`\n📊 Found ${hotelsWithoutBrand.length} hotels without brandId`);

        if (hotelsWithoutBrand.length > 0) {
            // Update hotels to use default brand
            const result = await Hotel.updateMany(
                { brandId: { $exists: false } },
                { $set: { brandId: defaultBrand._id } }
            );

            console.log(`✅ Updated ${result.modifiedCount} hotels to default brand`);
        }

        // Show summary
        const totalHotels = await Hotel.countDocuments();
        const hotelsWithBrand = await Hotel.countDocuments({ brandId: { $exists: true } });

        console.log('\n📈 Summary:');
        console.log(`   Total Hotels: ${totalHotels}`);
        console.log(`   Hotels with Brand: ${hotelsWithBrand}`);
        console.log(`   Default Brand ID: ${defaultBrand._id}`);

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run migration
migrate();
