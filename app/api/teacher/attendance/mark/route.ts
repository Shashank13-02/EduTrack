import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { studentId, date, status } = body;

        // Validation
        if (!studentId || !date || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['present', 'absent', 'late'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Check if attendance already exists for this date
        const existing = await Attendance.findOne({
            studentId,
            date: new Date(date),
        });

        if (existing) {
            // Update existing
            existing.status = status;
            existing.markedBy = tokenUser.userId as any;
            await existing.save();

            return NextResponse.json(
                { message: 'Attendance updated', attendance: existing },
                { status: 200 }
            );
        } else {
            // Create new
            const attendance = await Attendance.create({
                studentId,
                date: new Date(date),
                status,
                markedBy: tokenUser.userId as any,
            });

            return NextResponse.json(
                { message: 'Attendance marked', attendance },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Mark attendance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
