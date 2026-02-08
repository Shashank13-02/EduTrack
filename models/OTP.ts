import mongoose, { Schema, Document, Model } from 'mongoose';

export type OTPPurpose = 'REGISTRATION' | 'PASSWORD_RESET';

export interface IOTP extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    otp: string;
    purpose: OTPPurpose;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: String,
            required: [true, 'OTP is required'],
            length: 6,
        },
        purpose: {
            type: String,
            enum: ['REGISTRATION', 'PASSWORD_RESET'],
            required: [true, 'Purpose is required'],
            default: 'REGISTRATION',
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration date is required'],
        },
        isUsed: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for automatic cleanup of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent model recompilation in development
const OTP: Model<IOTP> =
    mongoose.models.OTP ||
    mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
