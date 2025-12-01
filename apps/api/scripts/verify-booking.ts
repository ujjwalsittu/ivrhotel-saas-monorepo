import { auth } from '../src/lib/auth';
import mongoose from 'mongoose';
import { headers } from 'next/headers';

const API_URL = 'http://localhost:4000/api';

async function main() {
    console.log('Starting Booking Verification...');

    // 1. Sign Up & Sign In
    const email = `booking-test-${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Booking Test User';

    console.log(`Signing Up user: ${email}...`);
    let res = await fetch(`${API_URL}/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });

    if (!res.ok) {
        console.error('Sign up failed:', await res.text());
        return;
    }

    console.log('Signing In...');
    res = await fetch(`${API_URL}/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        console.error('Sign in failed:', await res.text());
        return;
    }

    const cookie = res.headers.get('set-cookie');
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
        'Origin': 'http://localhost:4000'
    };

    // 2. Create Organization
    const orgName = `Hotel Group ${Date.now()}`;
    const orgSlug = `hotel-group-${Date.now()}`;
    console.log(`Creating Organization: ${orgName}...`);
    res = await fetch(`${API_URL}/auth/organization/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: orgName, slug: orgSlug })
    });
    const orgRes = await res.json();
    const organizationId = orgRes.id;
    console.log(`Organization created: ${organizationId}`);

    // 3. Create Hotel
    console.log('Creating Hotel...');
    const hotelData = {
        name: "Grand Hotel",
        slug: `grand-hotel-${Date.now()}`,
        planId: "60d5ecb8b487343568912345",
        contactNumber: "+1234567890",
        email: "info@grandhotel.com",
        address: { street: "123 Main St", city: "Metropolis", state: "NY", country: "USA", zipCode: "10001" },
        authorizedSignatory: { name: "John Doe", phone: "+1234567890" },
        hotelType: "PREMIUM",
        handlingType: "FULL",
        organizationId
    };

    res = await fetch(`${API_URL}/hotels`, {
        method: 'POST',
        headers,
        body: JSON.stringify(hotelData)
    });
    const hotel = await res.json();
    const hotelId = hotel._id;
    console.log(`Hotel created: ${hotelId}`);

    // 4. Create Room Type
    console.log('Creating Room Type...');
    const roomTypeData = {
        name: "Deluxe Room",
        code: "DLX",
        description: "A deluxe room",
        basePrice: 100,
        maxOccupancy: 2,
        amenities: ["Wifi", "TV"]
    };
    res = await fetch(`${API_URL}/hotels/${hotelId}/room-types`, {
        method: 'POST',
        headers,
        body: JSON.stringify(roomTypeData)
    });
    const roomType = await res.json();
    const roomTypeId = roomType._id;
    console.log(`Room Type created: ${roomTypeId}`);

    // 5. Create Floor & Room
    console.log('Creating Floor & Room...');
    const floorData = { name: "First Floor", number: 1, block: "A" };
    res = await fetch(`${API_URL}/hotels/${hotelId}/floors`, {
        method: 'POST',
        headers,
        body: JSON.stringify(floorData)
    });
    const floor = await res.json();
    const floorId = floor._id;

    const roomData = {
        number: "101",
        floorId,
        roomTypeId,
        status: "CLEAN"
    };
    res = await fetch(`${API_URL}/hotels/${hotelId}/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(roomData)
    });
    const room = await res.json();
    const roomId = room._id;
    console.log(`Room created: ${roomId}`);

    // 6. Create Booking
    console.log('Creating booking...');
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 1); // Tomorrow
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 2); // 2 days later

    const bookingData = {
        guest: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890'
        },
        roomTypeId,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        totalAmount: 200
    };

    const createRes = await fetch(`${API_URL}/hotels/${hotelId}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData)
    });

    if (!createRes.ok) {
        console.error('Create booking failed:', await createRes.text());
        return;
    }

    const booking = await createRes.json();
    console.log('Booking created:', booking._id);

    // 7. Cancel Booking
    console.log('Cancelling booking...');
    const cancelRes = await fetch(`${API_URL}/hotels/${hotelId}/bookings/${booking._id}/cancel`, {
        method: 'POST',
        headers
    });

    if (!cancelRes.ok) {
        console.error('Cancel booking failed:', await cancelRes.text());
        return;
    }
    console.log('Booking cancelled successfully');

    // 8. Create another booking for Check-in test
    console.log('Creating another booking for check-in...');
    const booking2Res = await fetch(`${API_URL}/hotels/${hotelId}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData)
    });
    const booking2 = await booking2Res.json();
    console.log('Booking 2 created:', booking2._id);

    // 9. Check In
    console.log('Checking in...');
    const checkInRes = await fetch(`${API_URL}/hotels/${hotelId}/bookings/${booking2._id}/check-in`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ roomId })
    });

    if (!checkInRes.ok) {
        console.error('Check-in failed:', await checkInRes.text());
    } else {
        console.log('Check-in successful');

        // 10. Check Out
        console.log('Checking out...');
        const checkOutRes = await fetch(`${API_URL}/hotels/${hotelId}/bookings/${booking2._id}/check-out`, {
            method: 'POST',
            headers
        });

        if (!checkOutRes.ok) {
            console.error('Check-out failed:', await checkOutRes.text());
        } else {
            console.log('Check-out successful');
        }
    }

    console.log('Booking Verification Complete!');
    process.exit(0);
}

main().catch(console.error);
