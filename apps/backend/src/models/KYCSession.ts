import mongoose, { Schema, Document } from 'mongoose';

interface IAuditLog {
    timestamp: Date;
    action: string;
    data: any;
    ipAddress?: string;
}

export interface IKYCSession extends Document {
    bookingId: mongoose.Types.ObjectId;
    guestId?: mongoose.Types.ObjectId;
    linkToken: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    step: 'identity' | 'selfie' | 'face_match' | 'review' | 'completed';

    // Guest information
    nationality: string;
    documentType: 'aadhaar' | 'passport' | 'driving_license';

    // Captured data
    documentData: {
        documentNumber?: string;
        name?: string;
        dob?: Date;
        address?: string;
        documentImage?: string;
        digilockerResponse?: any;
    };

    selfieImage?: string;
    faceMatchScore?: number;
    faceMatchResult?: 'pass' | 'fail' | 'manual_review';

    // Verification
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId | string; // 'system' | 'digilocker' | userId

    // Audit trail
    auditLog: IAuditLog[];

    // Security
    attempts: number;
    maxAttempts: number;
    expiresAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

const AuditLogSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
}, { _id: false });

const KYCSessionSchema: Schema = new Schema(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
        linkToken: { type: String, required: true, unique: true, index: true },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'failed'],
            default: 'pending'
        },
        step: {
            type: String,
            enum: ['identity', 'selfie', 'face_match', 'review', 'completed'],
            default: 'identity'
        },

        nationality: { type: String, default: 'IN' },
        documentType: {
            type: String,
            enum: ['aadhaar', 'passport', 'driving_license']
        },

        documentData: {
            documentNumber: { type: String },
            name: { type: String },
            dob: { type: Date },
            address: { type: String },
            documentImage: { type: String },
            digilockerResponse: { type: Schema.Types.Mixed }
        },

        selfieImage: { type: String },
        faceMatchScore: { type: Number, min: 0, max: 100 },
        faceMatchResult: {
            type: String,
            enum: ['pass', 'fail', 'manual_review']
        },

        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.Mixed }, // ObjectId or string

        auditLog: [AuditLogSchema],

        attempts: { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 5 },
        expiresAt: { type: Date, required: true }
    },
    { timestamps: true }
);

// Index for cleanup expired sessions
KYCSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
KYCSessionSchema.methods.addAuditLog = function (action: string, data: any, ipAddress?: string) {
    this.auditLog.push({
        timestamp: new Date(),
        action,
        data,
        ipAddress
    });
};

KYCSessionSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

KYCSessionSchema.methods.incrementAttempt = function () {
    this.attempts += 1;
    if (this.attempts >= this.maxAttempts) {
        this.status = 'failed';
    }
};

export const KYCSession = mongoose.model<IKYCSession>('KYCSession', KYCSessionSchema);
