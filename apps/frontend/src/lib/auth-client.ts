import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:4000/api/auth", // Adjust if your backend URL is different
});

export const { signIn, signOut, useSession } = authClient;
