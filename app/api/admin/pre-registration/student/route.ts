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
        const { name, email, department, year, registrationId } = body;

        // Validation
        if (!name || !email || !department || !year) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, department, year' },
                { status: 400 }
            );
        }

        if (year < 1 || year > 4) {
            return NextResponse.json(
                { error: 'Year must be between 1 and 4' },
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

        // Create pre-registered student
        const preRegUser = await PreRegisteredUser.create({
            name,
            email: email.toLowerCase(),
            role: 'STUDENT',
            department,
            year,
            registrationId: registrationId || undefined,
            isRegistered: false,
            createdBy: user.userId,
        });

        return NextResponse.json({
            success: true,
            message: 'Student pre-registered successfully',
            user: {
                id: preRegUser._id,
                name: preRegUser.name,
                email: preRegUser.email,
                department: preRegUser.department,
                year: preRegUser.year,
                registrationId: preRegUser.registrationId,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Pre-registration error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Email or Registration ID already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to pre-register student' },
            { status: 500 }
        );
    }
}
