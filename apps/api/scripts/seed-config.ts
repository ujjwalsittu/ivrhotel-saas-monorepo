import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Amenity } from '../src/models/Amenity';
import { PropertyType } from '../src/models/PropertyType';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivrhotel';

const amenities = [
    // General
    { name: 'Parking', code: 'PARKING', category: 'General', icon: 'Car' },
    { name: 'Wi-Fi', code: 'WIFI', category: 'General', icon: 'Wifi' },
    { name: '24x7 Reception', code: 'RECEPTION_247', category: 'General', icon: 'Clock' },
    { name: 'Wheelchair Access', code: 'ACCESSIBILITY', category: 'General', icon: 'Accessibility' },
    { name: 'CCTV', code: 'CCTV', category: 'General', icon: 'Camera' },
    { name: 'Fire Safety Compliance', code: 'FIRE_SAFETY', category: 'General', icon: 'Flame' },

    // Services
    { name: 'Room Service', code: 'ROOM_SERVICE', category: 'Services', icon: 'Utensils' },
    { name: 'Laundry Service', code: 'LAUNDRY', category: 'Services', icon: 'Shirt' },
    { name: 'Airport Pickup', code: 'AIRPORT_PICKUP', category: 'Services', icon: 'Plane' },

    // Wellness & Recreation
    { name: 'Swimming Pool', code: 'POOL', category: 'Wellness', icon: 'Waves' },
    { name: 'Gym / Fitness Centre', code: 'GYM', category: 'Wellness', icon: 'Dumbbell' },
    { name: 'Spa', code: 'SPA', category: 'Wellness', icon: 'Sparkles' },

    // F&B
    { name: 'Restaurant', code: 'RESTAURANT', category: 'F&B', icon: 'UtensilsCrossed' },
    { name: 'Bar', code: 'BAR', category: 'F&B', icon: 'Wine' },
    { name: 'Café', code: 'CAFE', category: 'F&B', icon: 'Coffee' },

    // Events
    { name: 'Conference Hall', code: 'CONFERENCE', category: 'Events', icon: 'Presentation' },
    { name: 'Banquet Hall', code: 'BANQUET', category: 'Events', icon: 'PartyPopper' }
];

const propertyTypes = [
    { name: 'Hotel', code: 'HOTEL', description: 'Standard hotel property' },
    { name: 'Resort', code: 'RESORT', description: 'Leisure property with recreational facilities' },
    { name: 'Guest House', code: 'GUEST_HOUSE', description: 'Small lodging establishment' },
    { name: 'Homestay', code: 'HOMESTAY', description: 'Accommodation in a private home' },
    { name: 'Service Apartment', code: 'SERVICE_APARTMENT', description: 'Furnished apartment for short/long stays' },
    { name: 'Boutique Hotel', code: 'BOUTIQUE', description: 'Small, stylish hotel' },
    { name: 'Budget Hotel', code: 'BUDGET', description: 'Low-cost accommodation' }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Seed Amenities
        console.log('Seeding Amenities...');
        for (const amenity of amenities) {
            await Amenity.findOneAndUpdate(
                { code: amenity.code },
                amenity,
                { upsert: true, new: true }
            );
        }
        console.log('Amenities seeded successfully');

        // Seed Property Types
        console.log('Seeding Property Types...');
        for (const type of propertyTypes) {
            await PropertyType.findOneAndUpdate(
                { code: type.code },
                type,
                { upsert: true, new: true }
            );
        }
        console.log('Property Types seeded successfully');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
