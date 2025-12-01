import { auth } from "../src/lib/auth";
import { mongoClient } from "../src/lib/mongodb";

const API_URL = "http://localhost:4000/api";

async function main() {
    console.log("Starting Onboarding Verification...");

    // 1. Sign Up & Sign In
    const email = `onboarding-${Date.now()}@example.com`;
    const password = "password123";
    const name = "Onboarding User";

    console.log(`Signing Up user: ${email}...`);
    let res = await fetch(`${API_URL}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
    });

    if (!res.ok) {
        console.error(`Sign up failed: Status ${res.status}`);
        console.error("Response:", await res.text());
        process.exit(1);
    }

    console.log("Signing In...");
    res = await fetch(`${API_URL}/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        console.error("Sign in failed:", await res.text());
        process.exit(1);
    }

    const signInRes = await res.json();
    const token = signInRes.token; // Access token from response if available, or we rely on cookie?
    // better-auth returns user and session. Session has token?
    // Actually better-auth sets cookie. But in node fetch we need to handle it.
    // Let's grab cookie from response headers.

    const cookie = res.headers.get("set-cookie");
    const headers = {
        "Content-Type": "application/json",
        "Cookie": cookie || "",
        "Origin": "http://localhost:4000" // Required for CSRF
    };

    console.log("User signed in.");

    // 2. Create Organization
    const orgName = `Hotel Group ${Date.now()}`;
    const orgSlug = `hotel-group-${Date.now()}`;

    console.log(`Creating Organization: ${orgName}...`);
    res = await fetch(`${API_URL}/auth/organization/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: orgName, slug: orgSlug })
    });

    if (!res.ok) {
        console.error("Create organization failed:", await res.text());
        // Don't exit, maybe user already has org? But this is new user.
        process.exit(1);
    }

    const orgRes = await res.json();
    const organizationId = orgRes.id;
    console.log(`Organization created: ${organizationId}`);

    // 3. Create Hotel (Draft)
    console.log("Creating Hotel (Draft)...");
    const hotelData = {
        name: "Grand Hotel",
        slug: `grand-hotel-${Date.now()}`,
        planId: "60d5ecb8b487343568912345", // Dummy ObjectId
        contactNumber: "+1234567890",
        email: "info@grandhotel.com",
        address: {
            street: "123 Main St",
            city: "Metropolis",
            state: "NY",
            country: "USA",
            zipCode: "10001"
        },
        authorizedSignatory: {
            name: "John Doe",
            phone: "+1234567890"
        },
        hotelType: "PREMIUM",
        handlingType: "FULL",
        organizationId // Pass explicit org ID
    };

    res = await fetch(`${API_URL}/hotels`, {
        method: "POST",
        headers,
        body: JSON.stringify(hotelData)
    });

    if (!res.ok) {
        console.error("Create hotel failed:", await res.text());
        process.exit(1);
    }

    const hotel = await res.json();
    const hotelId = hotel._id;
    console.log(`Hotel created: ${hotelId}`);

    // 4. Update Hotel Details (Onboarding)
    console.log("Updating Hotel Onboarding Data...");
    const updateData = {
        legalAddress: "123 Legal Way, Metropolis, NY",
        gstNumber: "GST123456789",
        businessStructure: "PRIVATE_LIMITED"
    };

    res = await fetch(`${API_URL}/hotels/${hotelId}/onboarding`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updateData)
    });

    if (!res.ok) {
        console.error("Update onboarding failed:", await res.text());
        process.exit(1);
    }
    console.log("Hotel data updated.");

    // 5. Submit Onboarding
    console.log("Submitting Onboarding...");
    // First, we need to make sure we have all required fields.
    // The controller checks for authorizedSignatory object structure.
    // Our createHotel passed authorizedSignatory as string (from schema), but onboarding controller expects object.
    // Wait, createHotelSchema in hotel.controller.ts says authorizedSignatory is string.
    // But onboardingDataSchema in onboarding.controller.ts says it's object { name, phone, signature }.
    // This is a mismatch we need to fix in code or here.
    // Let's update it via onboarding endpoint first to match requirements.

    const authSignatoryUpdate = {
        authorizedSignatory: {
            name: "John Doe",
            phone: "+1234567890"
        }
    };

    await fetch(`${API_URL}/hotels/${hotelId}/onboarding`, {
        method: "PUT",
        headers,
        body: JSON.stringify(authSignatoryUpdate)
    });

    res = await fetch(`${API_URL}/hotels/${hotelId}/onboarding/submit`, {
        method: "POST",
        headers
    });

    if (!res.ok) {
        console.error("Submit onboarding failed:", await res.text());
        process.exit(1);
    }

    const submitRes = await res.json();
    console.log("Onboarding submitted:", submitRes.message);

    if (submitRes.hotel.onboardingStatus !== 'submitted') {
        console.error("Status mismatch:", submitRes.hotel.onboardingStatus);
        process.exit(1);
    }

    console.log("Verification Complete!");
    process.exit(0);
}

main().catch(console.error);
