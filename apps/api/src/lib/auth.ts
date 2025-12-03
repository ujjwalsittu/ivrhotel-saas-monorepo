import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization, jwt, deviceAuthorization, multiSession, lastLoginMethod } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { mongoClient, db } from "./mongodb";
import { emailService } from "../services/email.service";

export const auth = betterAuth({
    experimental: {
        joins: true,
    },
    database: mongodbAdapter(db as any, {
        client: mongoClient as any,
        transaction: false // Disable transactions for local standalone MongoDB
    }),

    // Secret for session encryption (required)
    secret: process.env.BETTER_AUTH_SECRET || "default-secret-change-in-production-min-32-chars",

    // Base URL for callbacks
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",

    plugins: [
        organization({
            roles: {
                brand_admin: {
                    authorize: async () => ({ success: true }),
                    statements: []
                },
                hotel_admin: {
                    authorize: async () => ({ success: true }),
                    statements: []
                },
                manager: {
                    authorize: async () => ({ success: true }),
                    statements: []
                },
                front_desk: {
                    authorize: async () => ({ success: true }),
                    statements: []
                },
                housekeeping: {
                    authorize: async () => ({ success: true }),
                    statements: []
                },
                kitchen: {
                    authorize: async () => ({ success: true }),
                    statements: []
                }
            } as any
        }),
        jwt(),
        deviceAuthorization(),
        multiSession(),
        lastLoginMethod(),
        passkey()
    ],

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false // Don't allow user to set their own role during sign up
            },
            brandId: {
                type: "string",
                required: false,
                input: false
            },
            primaryHotelId: {
                type: "string",
                required: false,
                input: false
            },
            phoneNumber: {
                type: "string",
                required: false,
                input: false
            }
        }
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
        async sendResetPassword({ user, url }) {
            console.log("Reset password url:", url);
            await emailService.sendPasswordReset(user.email, url);
        }
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
    },

    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
    }
});
