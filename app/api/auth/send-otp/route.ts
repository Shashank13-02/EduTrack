import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { generateOTP, createOTPRecord, isRateLimited } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/emailjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check rate limiting
        const rateLimitResult = await isRateLimited(email.toLowerCase());
        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    error: `Please wait ${rateLimitResult.remainingSeconds} seconds before requesting a new OTP`,
                    remainingSeconds: rateLimitResult.remainingSeconds,
                },
                { status: 429 }
            );
        }

        // Check if email exists in pre-registered users
        const preRegUser = await PreRegisteredUser.findOne({
            email: email.toLowerCase(),
            isRegistered: false,
        });

        if (!preRegUser) {
            return NextResponse.json(
                {
                    error: 'This email is not authorized. You are not in the university database. Please contact administration.',
                },
                { status: 403 }
            );
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await createOTPRecord(email.toLowerCase(), otp, 'REGISTRATION', 10);

        // Send OTP via EmailJS
        const emailResult = await sendOTPEmail({
            toEmail: email,
            toName: preRegUser.name,
            otpCode: otp,
        });

        if (!emailResult.success) {
            return NextResponse.json(
                { error: 'Failed to send OTP email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully to your email',
            expiresIn: 600, // 10 minutes in seconds
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        );
    }
}
