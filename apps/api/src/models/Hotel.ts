import mongoose, { Schema, Document } from 'mongoose';

// Document verification status
interface DocumentVerification {
    url: string;
    status: 'pending' | 'approved' | 'rejected' | 'reupload_requested';
    comments?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
}

export interface IHotel extends Document {
    name: string;
    slug: string;
    organizationId?: string; // Link to better-auth Organization
    brandId?: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;

    // Contact Info
    contactNumber: string;
    email: string;

    // Location
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    legalAddress?: string; // Full legal address for registration

    // Hotel Classification
    hotelType: 'LODGING' | 'NORMAL' | 'PREMIUM' | 'LUXE' | 'PREMIUM_LUXE';
    handlingType: 'ROOMS' | 'ROOMS_KITCHEN' | 'ROOMS_RESTAURANT_KITCHEN' | 'FULL';
    safetyRating?: string;

    // Legal & Compliance
    gstNumber?: string;
    authorizedSignatory: {
        name: string;
        phone: string;
        signature?: string; // URL to signature image
    };
    businessStructure?: 'PRIVATE_LIMITED' | 'LLP' | 'INDIVIDUAL';

    // Documents with verification tracking
    documents: {
        gstCertificate?: DocumentVerification;
        legalDocs?: {
            cin?: DocumentVerification; // For Private Limited
            llpin?: DocumentVerification; // For LLP
            ownerAadhaar?: DocumentVerification; // For Individual
            businessPan?: DocumentVerification;
        };
        cancelledCheque?: DocumentVerification;
        liquorLicense?: DocumentVerification;
        fireSafety?: DocumentVerification;
        fssai?: DocumentVerification;
        utilityBill?: DocumentVerification;
    };

    // Photos
    photos: {
        lobby: string[];
        rooms: string[];
        washrooms: string[];
        restaurant: string[];
        other: string[];
    };

    // Branding
    logo?: string;

    // Onboarding Workflow
    onboardingStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    submittedAt?: Date;
    approvedAt?: Date;

    // Hotel Status (operational)
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

    // Domain & Customization (for white-label)
    customDomain?: string;
    sslStatus?: 'pending' | 'active' | 'expired';

    createdAt: Date;
    updatedAt: Date;
}

const DocumentVerificationSchema = new Schema({
    url: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reupload_requested'],
        default: 'pending'
    },
    comments: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
}, { _id: false });

const HotelSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        organizationId: { type: String }, // Link to better-auth Organization
        brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },

        contactNumber: { type: String, required: true },
        email: { type: String, required: true },

        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            zipCode: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
        legalAddress: { type: String },

        hotelType: {
            type: String,
            enum: ['LODGING', 'NORMAL', 'PREMIUM', 'LUXE', 'PREMIUM_LUXE'],
            default: 'NORMAL'
        },
        handlingType: {
            type: String,
            enum: ['ROOMS', 'ROOMS_KITCHEN', 'ROOMS_RESTAURANT_KITCHEN', 'FULL'],
            default: 'ROOMS'
        },
        safetyRating: { type: String },

        gstNumber: { type: String },
        authorizedSignatory: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            signature: { type: String }
        },
        businessStructure: {
            type: String,
            enum: ['PRIVATE_LIMITED', 'LLP', 'INDIVIDUAL']
        },

        documents: {
            gstCertificate: DocumentVerificationSchema,
            legalDocs: {
                cin: DocumentVerificationSchema,
                llpin: DocumentVerificationSchema,
                ownerAadhaar: DocumentVerificationSchema,
                businessPan: DocumentVerificationSchema
            },
            cancelledCheque: DocumentVerificationSchema,
            liquorLicense: DocumentVerificationSchema,
            fireSafety: DocumentVerificationSchema,
            fssai: DocumentVerificationSchema,
            utilityBill: DocumentVerificationSchema
        },

        photos: {
            lobby: [{ type: String }],
            rooms: [{ type: String }],
            washrooms: [{ type: String }],
            restaurant: [{ type: String }],
            other: [{ type: String }]
        },

        logo: { type: String },

        onboardingStatus: {
            type: String,
            enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
            default: 'draft'
        },
        submittedAt: { type: Date },
        approvedAt: { type: Date },

        status: {
            type: String,
            enum: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
            default: 'PENDING'
        },

        customDomain: { type: String },
        sslStatus: {
            type: String,
            enum: ['pending', 'active', 'expired']
        }
    },
    { timestamps: true }
);

// Indexes
HotelSchema.index({ slug: 1 });
HotelSchema.index({ organizationId: 1 });
HotelSchema.index({ brandId: 1 });
HotelSchema.index({ status: 1 });
HotelSchema.index({ onboardingStatus: 1 });

export const Hotel = mongoose.model<IHotel>('Hotel', HotelSchema);
