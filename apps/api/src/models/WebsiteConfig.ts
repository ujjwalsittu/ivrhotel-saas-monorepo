import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteConfig extends Document {
    hotelId: mongoose.Types.ObjectId;
    domain?: string;
    slug: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        font: string;
    };
    content: {
        heroImage?: string;
        aboutText?: string;
        contactEmail?: string;
    };
    pages: Array<{
        title: string;
        slug: string;
        content: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const WebsiteConfigSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, unique: true },
        domain: { type: String, unique: true, sparse: true },
        slug: { type: String, required: true, unique: true },
        theme: {
            primaryColor: { type: String, default: '#000000' },
            secondaryColor: { type: String, default: '#ffffff' },
            font: { type: String, default: 'Inter' }
        },
        content: {
            heroImage: { type: String },
            aboutText: { type: String },
            contactEmail: { type: String }
        },
        pages: [{
            title: { type: String, required: true },
            slug: { type: String, required: true },
            content: { type: String, required: true }
        }]
    },
    { timestamps: true }
);

export const WebsiteConfig = mongoose.model<IWebsiteConfig>('WebsiteConfig', WebsiteConfigSchema);
