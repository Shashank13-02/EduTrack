import OTP from '@/models/OTP';
import { connectDB } from './db';

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP record in the database
 * @param email - User's email
 * @param otp - Generated OTP code
 * @param purpose - Purpose of OTP (REGISTRATION or PASSWORD_RESET)
 * @param expirationMinutes - Minutes until OTP expires (default: 10)
 */
export async function createOTPRecord(
    email: string,
    otp: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' = 'REGISTRATION',
    expirationMinutes: number = 10
): Promise<void> {
    await connectDB();

    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Invalidate any existing OTPs for this email and purpose
    await OTP.updateMany(
        { email, purpose, isUsed: false },
        { $set: { isUsed: true } }
    );

    // Create new OTP
    await OTP.create({
        email,
        otp,
        purpose,
        expiresAt,
        isUsed: false,
    });
}

/**
 * Verify an OTP
 * @param email - User's email
 * @param otp - OTP code to verify
 * @param purpose - Purpose of OTP
 * @returns true if valid, false otherwise
 */
export async function verifyOTP(
    email: string,
    otp: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' = 'REGISTRATION',
    markAsUsed: boolean = true
): Promise<{ valid: boolean; error?: string }> {
    await connectDB();

    const otpRecord = await OTP.findOne({
        email: email.toLowerCase(),
        otp,
        purpose,
        isUsed: false,
    });

    if (!otpRecord) {
        return { valid: false, error: 'Invalid OTP code' };
    }

    if (new Date() > otpRecord.expiresAt) {
        return { valid: false, error: 'OTP has expired' };
    }

    if (markAsUsed) {
        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();
    }

    return { valid: true };
}

/**
 * Cleanup expired OTPs (optional, as TTL index handles this automatically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
    await connectDB();

    const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() },
    });

    return result.deletedCount || 0;
}

/**
 * Check if an OTP request should be rate-limited
 * @param email - User's email
 * @param cooldownSeconds - Seconds to wait between requests (default: 60)
 * @returns true if rate limited, false if request is allowed
 */
export async function isRateLimited(
    email: string,
    cooldownSeconds: number = 60
): Promise<{ limited: boolean; remainingSeconds?: number }> {
    await connectDB();

    const recentOTP = await OTP.findOne({
        email: email.toLowerCase(),
        purpose: 'REGISTRATION',
    }).sort({ createdAt: -1 });

    if (!recentOTP) {
        return { limited: false };
    }

    const timeSinceLastOTP = Date.now() - recentOTP.createdAt.getTime();
    const cooldownMs = cooldownSeconds * 1000;

    if (timeSinceLastOTP < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
        return { limited: true, remainingSeconds };
    }

    return { limited: false };
}
