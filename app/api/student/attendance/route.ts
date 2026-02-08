import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
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

        // Get attendance records
        const attendanceRecords = await Attendance.find({ studentId })
            .sort({ date: -1 })
            .lean();

        // Calculate statistics
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(a => a.status === 'present').length;
        const late = attendanceRecords.filter(a => a.status === 'late').length;
        const absent = attendanceRecords.filter(a => a.status === 'absent').length;
        const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

        return NextResponse.json({
            attendance: attendanceRecords,
            total,
            present,
            late,
            absent,
            percentage
        }, { status: 200 });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
