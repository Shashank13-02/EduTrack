import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // Verify OTP (don't mark as used yet, registration will do it)
        const verificationResult = await verifyOTP(email.toLowerCase(), otp, 'REGISTRATION', false);

        if (!verificationResult.valid) {
            return NextResponse.json(
                { error: verificationResult.error || 'Invalid OTP' },
                { status: 400 }
            );
        }

        // Fetch pre-registered user data
        const preRegUser = await PreRegisteredUser.findOne({
            email: email.toLowerCase(),
            isRegistered: false,
        });

        if (!preRegUser) {
            return NextResponse.json(
                { error: 'Pre-registered user not found' },
                { status: 404 }
            );
        }

        // Return pre-registered user data for account creation
        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            userData: {
                email: preRegUser.email,
                name: preRegUser.name,
                role: preRegUser.role,
                department: preRegUser.department,
                ...(preRegUser.role === 'STUDENT' && {
                    year: preRegUser.year,
                    registrationId: preRegUser.registrationId,
                }),
                ...(preRegUser.role === 'TEACHER' && {
                    subject: preRegUser.subject,
                    yearsTaught: preRegUser.yearsTaught,
                }),
            },
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}
