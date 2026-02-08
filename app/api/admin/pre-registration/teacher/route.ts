import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check if user is admin or teacher
        const user = await getUserFromRequest(request);
        if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, department, subject, yearsTaught } = body;

        // Validation
        if (!name || !email || !department || !subject || !yearsTaught) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, department, subject, yearsTaught' },
                { status: 400 }
            );
        }

        if (!Array.isArray(yearsTaught) || yearsTaught.length === 0) {
            return NextResponse.json(
                { error: 'yearsTaught must be a non-empty array' },
                { status: 400 }
            );
        }

        if (!yearsTaught.every((y: number) => y >= 1 && y <= 4)) {
            return NextResponse.json(
                { error: 'All years taught must be between 1 and 4' },
                { status: 400 }
            );
        }

        // Check if email already exists in pre-registered users
        const existing = await PreRegisteredUser.findOne({
            email: email.toLowerCase()
        });

        if (existing) {
            return NextResponse.json(
                { error: 'This email is already pre-registered' },
                { status: 409 }
            );
        }

        // Create pre-registered teacher
        const preRegUser = await PreRegisteredUser.create({
            name,
            email: email.toLowerCase(),
            role: 'TEACHER',
            department,
            subject,
            yearsTaught,
            isRegistered: false,
            createdBy: user.userId,
        });

        return NextResponse.json({
            success: true,
            message: 'Teacher pre-registered successfully',
            user: {
                id: preRegUser._id,
                name: preRegUser.name,
                email: preRegUser.email,
                department: preRegUser.department,
                subject: preRegUser.subject,
                yearsTaught: preRegUser.yearsTaught,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Pre-registration error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to pre-register teacher' },
            { status: 500 }
        );
    }
}
