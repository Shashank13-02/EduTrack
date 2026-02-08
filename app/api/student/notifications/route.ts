import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role.toUpperCase() !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const notifications = await Notification.find({ userId: tokenUser.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role.toUpperCase() !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await Notification.updateMany(
                { userId: tokenUser.userId, isRead: false },
                { $set: { isRead: true } }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: tokenUser.userId },
                { $set: { isRead: true } }
            );
        } else {
            return NextResponse.json(
                { error: 'ID or markAll required' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Notifications updated' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
