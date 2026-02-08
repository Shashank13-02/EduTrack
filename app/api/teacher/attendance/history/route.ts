import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import AttendanceSession from '@/models/AttendanceSession';
import { getUserFromRequest } from '@/lib/auth';

// GET: Get attendance history (all previous sessions)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all sessions for this teacher, sorted by date (newest first)
        const sessions = await AttendanceSession.find({
            teacherId: tokenUser.userId,
        })
            .populate('attendedStudents', 'name email department year')
            .sort({ date: -1, startTime: -1 })
            .limit(100); // Limit to last 100 sessions

        // Group sessions by date
        const sessionsByDate = sessions.reduce((acc: any, session: any) => {
            const dateKey = new Date(session.date).toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push({
                _id: session._id,
                sessionCode: session.sessionCode,
                subject: session.subject,
                startTime: session.startTime,
                endTime: session.endTime,
                isActive: session.isActive,
                date: session.date,
                attendedStudents: session.attendedStudents || [],
                attendedCount: session.attendedStudents?.length || 0,
            });
            return acc;
        }, {});

        return NextResponse.json(
            { sessionsByDate },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get attendance history error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
