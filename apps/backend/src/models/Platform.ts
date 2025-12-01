import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatform extends Document {
    name: string;
    settings: {
        email: {
            primaryProvider: 'resend' | 'ses';
            resend?: {
                apiKey: string;
            };
            ses?: {
                accessKeyId: string;
                secretAccessKey: string;
                region: string;
            };
        };
        sms: {
            primaryProvider: 'twilio' | 'msg91';
            twilio?: {
                accountSid: string;
                authToken: string;
                fromNumber: string;
            };
            msg91?: {
                authKey: string;
                senderId: string;
            };
        };
        whatsapp: {
            provider: 'whatsapp_cloud_api';
            phoneNumberId: string;
            accessToken: string;
            businessAccountId: string;
        };
        payment: {
            razorpay?: {
                keyId: string;
                keySecret: string;
            };
            stripe?: {
                publishableKey: string;
                secretKey: string;
            };
            paypal?: {
                clientId: string;
                clientSecret: string;
                mode: 'sandbox' | 'live';
            };
        };
    };
    billing: {
        whatsappCostPerMessage: number; // in platform currency
        smsCostPerMessage: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const PlatformSchema: Schema = new Schema(
    {
        name: { type: String, required: true, default: 'IVR Hotel Platform' },
        settings: {
            email: {
                primaryProvider: { type: String, enum: ['resend', 'ses'], default: 'resend' },
                resend: {
                    apiKey: { type: String }
                },
                ses: {
                    accessKeyId: { type: String },
                    secretAccessKey: { type: String },
                    region: { type: String }
                }
            },
            sms: {
                primaryProvider: { type: String, enum: ['twilio', 'msg91'], default: 'twilio' },
                twilio: {
                    accountSid: { type: String },
                    authToken: { type: String },
                    fromNumber: { type: String }
                },
                msg91: {
                    authKey: { type: String },
                    senderId: { type: String }
                }
            },
            whatsapp: {
                provider: { type: String, default: 'whatsapp_cloud_api' },
                phoneNumberId: { type: String },
                accessToken: { type: String },
                businessAccountId: { type: String }
            },
            payment: {
                razorpay: {
                    keyId: { type: String },
                    keySecret: { type: String }
                },
                stripe: {
                    publishableKey: { type: String },
                    secretKey: { type: String }
                },
                paypal: {
                    clientId: { type: String },
                    clientSecret: { type: String },
                    mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' }
                }
            }
        },
        billing: {
            whatsappCostPerMessage: { type: Number, default: 0.05 },
            smsCostPerMessage: { type: Number, default: 0.02 }
        }
    },
    { timestamps: true }
);

export const Platform = mongoose.model<IPlatform>('Platform', PlatformSchema);
