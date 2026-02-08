import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Performance from '@/models/Performance';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const studentId = tokenUser.userId;

        // Get performance records
        const performanceRecords = await Performance.find({ studentId }).lean();

        return NextResponse.json({ performanceRecords }, { status: 200 });
    } catch (error) {
        console.error('Get performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
