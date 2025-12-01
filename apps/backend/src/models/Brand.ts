import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    planId?: mongoose.Types.ObjectId; // Subscription plan
    settings: {
        branding: {
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
        };
        policies: {
            cancellation: {
                freeCancellationHours: number; // Hours before check-in
                cancellationFeePercentage: number; // % of total amount
            };
            checkIn: {
                defaultTime: string; // "14:00"
                earlyCheckInFee?: number;
            };
            checkOut: {
                defaultTime: string; // "12:00"
                lateCheckOutFee?: number;
            };
        };
        communication: {
            emailProvider?: 'resend' | 'ses'; // Override platform default
            smsProvider?: 'twilio' | 'msg91';
            customEmailConfig?: any;
            customSmsConfig?: any;
        };
    };
    hotels: mongoose.Types.ObjectId[]; // References to Hotel model
    isActive: boolean;
    isDefault: boolean; // For migration of existing hotels
    createdAt: Date;
    updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        logo: { type: String },
        description: { type: String },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
        settings: {
            branding: {
                primaryColor: { type: String, default: '#000000' },
                secondaryColor: { type: String, default: '#6B7280' },
                accentColor: { type: String, default: '#3B82F6' }
            },
            policies: {
                cancellation: {
                    freeCancellationHours: { type: Number, default: 24 },
                    cancellationFeePercentage: { type: Number, default: 20 }
                },
                checkIn: {
                    defaultTime: { type: String, default: '14:00' },
                    earlyCheckInFee: { type: Number, default: 0 }
                },
                checkOut: {
                    defaultTime: { type: String, default: '12:00' },
                    lateCheckOutFee: { type: Number, default: 0 }
                }
            },
            communication: {
                emailProvider: { type: String, enum: ['resend', 'ses'] },
                smsProvider: { type: String, enum: ['twilio', 'msg91'] },
                customEmailConfig: { type: Schema.Types.Mixed },
                customSmsConfig: { type: Schema.Types.Mixed }
            }
        },
        hotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
        isActive: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Index for slug uniqueness and brand lookups
BrandSchema.index({ slug: 1 });
BrandSchema.index({ isActive: 1 });

export const Brand = mongoose.model<IBrand>('Brand', BrandSchema);
