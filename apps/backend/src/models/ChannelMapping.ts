import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomMapping {
    internalRoomTypeId: mongoose.Types.ObjectId;
    otaRoomName: string;
    otaRoomCode?: string;
}

export interface IChannelMapping extends Document {
    hotelId: mongoose.Types.ObjectId;
    ota: 'MAKEMYTRIP' | 'GOIBIBO' | 'BOOKING_COM' | 'AIRBNB' | 'OYO' | 'AGODA' | 'EXPEDIA' | 'OTHER';

    // Configuration
    email: string; // OTA notification email
    apiKey?: string; // If OTA supports API
    apiSecret?: string;

    // Room mappings
    roomMappings: IRoomMapping[];

    // Settings
    active: boolean;
    autoImport: boolean; // Auto-create bookings from emails

    // Stats
    totalBookings: number;
    lastSyncedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const RoomMappingSchema = new Schema({
    internalRoomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    otaRoomName: { type: String, required: true },
    otaRoomCode: { type: String }
}, { _id: false });

const ChannelMappingSchema: Schema = new Schema(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        ota: {
            type: String,
            enum: ['MAKEMYTRIP', 'GOIBIBO', 'BOOKING_COM', 'AIRBNB', 'OYO', 'AGODA', 'EXPEDIA', 'OTHER'],
            required: true
        },

        email: { type: String, required: true },
        apiKey: { type: String },
        apiSecret: { type: String },

        roomMappings: [RoomMappingSchema],

        active: { type: Boolean, default: true },
        autoImport: { type: Boolean, default: true },

        totalBookings: { type: Number, default: 0 },
        lastSyncedAt: { type: Date }
    },
    { timestamps: true }
);

// Indexes
ChannelMappingSchema.index({ hotelId: 1, ota: 1 }, { unique: true });
ChannelMappingSchema.index({ email: 1 });

// Methods
ChannelMappingSchema.methods.mapRoom = function (otaRoomName: string): mongoose.Types.ObjectId | null {
    const mapping = this.roomMappings.find((m: IRoomMapping) => m.otaRoomName === otaRoomName);
    return mapping ? mapping.internalRoomTypeId : null;
};

export const ChannelMapping = mongoose.model<IChannelMapping>('ChannelMapping', ChannelMappingSchema);
