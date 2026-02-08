import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password-utils';
import { logActivityServer, activityDescriptions, ACTIVITY_TYPES } from '@/lib/activity-logger';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            email,
            password,
            otp,
            // Optional fields
            bio,
            hobbies,
            skills,
        } = body;

        // Basic validation
        if (!email || !password || !otp) {
            return NextResponse.json(
                { error: 'Email, password, and OTP are required' },
                { status: 400 }
            );
        }

        // Verify OTP
        const verificationResult = await verifyOTP(email.toLowerCase(), otp, 'REGISTRATION');

        if (!verificationResult.valid) {
            return NextResponse.json(
                { error: verificationResult.error || 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Get pre-registered user data
        const preRegUser = await PreRegisteredUser.findOne({
            email: email.toLowerCase(),
            isRegistered: false,
        });

        if (!preRegUser) {
            return NextResponse.json(
                { error: 'Pre-registered user not found or already registered' },
                { status: 404 }
            );
        }

        // Check if user already exists (prevent duplicates)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login.' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user with pre-registered data
        const userData: any = {
            name: preRegUser.name,
            email: preRegUser.email,
            passwordHash,
            role: preRegUser.role,
            department: preRegUser.department,
            isLegacyUser: false,
            preRegisteredId: preRegUser._id,
            bio: bio || '',
            hobbies: hobbies || [],
            skills: skills || [],
        };

        // Add role-specific fields
        if (preRegUser.role === 'STUDENT') {
            userData.year = preRegUser.year;
            if (preRegUser.registrationId) {
                userData.registrationId = preRegUser.registrationId;
            }
        } else if (preRegUser.role === 'TEACHER') {
            userData.yearsTaught = preRegUser.yearsTaught;
            userData.subject = preRegUser.subject;
        }

        const user = await User.create(userData);

        // Mark pre-registered user as registered
        await PreRegisteredUser.findByIdAndUpdate(preRegUser._id, {
            isRegistered: true,
            registeredAt: new Date(),
            userId: user._id,
        });

        // Log registration activity
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        logActivityServer({
            userId: user._id.toString(),
            userRole: user.role,
            userName: user.name,
            userEmail: user.email,
            activityType: ACTIVITY_TYPES.REGISTER,
            description: activityDescriptions.register(user.name, user.role),
            metadata: {
                department: user.department,
                ...(user.role === 'STUDENT' ? { year: user.year, registrationId: user.registrationId } : {}),
                ...(user.role === 'TEACHER' ? { subject: user.subject, yearsTaught: user.yearsTaught } : {}),
            },
            ipAddress,
            userAgent,
        }).catch(err => console.error('Failed to log registration activity:', err));

        // Generate JWT token and auto-login
        const token = await signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified || true,
        });

        // Set cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Registration successful! Welcome to EduTrack.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                },
            },
            { status: 201 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'An account with this email or registration ID already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
