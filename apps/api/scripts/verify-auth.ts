const BASE_URL = "http://localhost:4000";

async function verifyAuth() {
    try {
        console.log("Starting Verification via Fetch...");

        const email = `test-${Date.now()}@example.com`;
        const password = "password123";
        const name = "Test User";

        // 1. Sign Up
        console.log("Signing Up...");
        const signUpRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name })
        });

        if (!signUpRes.ok) {
            const err = await signUpRes.text();
            console.error("SignUp Error:", err);
            return;
        }
        console.log("User created:", email);

        // 2. Sign In
        console.log("Signing In...");
        const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!signInRes.ok) {
            const err = await signInRes.text();
            console.error("SignIn Error:", err);
            return;
        }

        // Extract Cookie
        const cookie = signInRes.headers.get("set-cookie");
        if (!cookie) {
            console.error("No cookie returned from sign in");
            return;
        }
        console.log("Got Cookie:", cookie);

        // 3. Create Organization
        console.log("Creating Organization...");
        const orgName = `Hotel ${Date.now()}`;
        const orgSlug = `hotel-${Date.now()}`;

        const orgRes = await fetch(`${BASE_URL}/api/auth/organization/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookie,
                "Origin": BASE_URL // Required by better-auth
            },
            body: JSON.stringify({ name: orgName, slug: orgSlug })
        });

        if (!orgRes.ok) {
            const err = await orgRes.text();
            console.error("Create Org Error:", orgRes.status, err);
            return;
        }

        const orgData = await orgRes.json();
        console.log("Organization created:", orgData?.name);
        console.log("Verification Complete!");

    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

verifyAuth();
