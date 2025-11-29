import { betterAuth } from "better-auth";
import { mongooseAdapter } from "better-auth/adapters/mongoose";
import mongoose from "mongoose";

export const auth = betterAuth({
    database: mongooseAdapter(mongoose.connection),
    emailAndPassword: {
        enabled: true,
    },
    // Add other providers here
});
