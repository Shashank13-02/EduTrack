import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { activityType, description, metadata } = body;

        if (!activityType || !description) {
            return NextResponse.json(
                { error: 'Activity type and description are required' },
                { status: 400 }
            );
        }

        // Get IP address and user agent from request
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const activity = await ActivityLog.create({
            userId: user.userId,
            userRole: user.role,
            userName: '', // Will be filled from user data if needed
            userEmail: user.email,
            activityType,
            description,
            metadata: metadata || {},
            ipAddress,
            userAgent,
        });

        return NextResponse.json(
            {
                message: 'Activity logged successfully',
                activityId: activity._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error logging activity:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
