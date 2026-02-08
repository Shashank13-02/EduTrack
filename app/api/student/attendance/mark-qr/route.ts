import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AttendanceSession from '@/models/AttendanceSession';
import Attendance from '@/models/Attendance';
import { getUserFromRequest } from '@/lib/auth';
import { calculateDistance, isWithinRange } from '@/lib/geolocation';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { sessionCode, latitude, longitude } = body;

        // Validation
        if (!sessionCode) {
            return NextResponse.json(
                { error: 'Session code is required' },
                { status: 400 }
            );
        }

        if (latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Location is required to mark attendance' },
                { status: 400 }
            );
        }

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return NextResponse.json(
                { error: 'Invalid location coordinates' },
                { status: 400 }
            );
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find active session for TODAY only
        const session = await AttendanceSession.findOne({
            sessionCode,
            isActive: true,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Invalid, expired, or inactive session code. Please ensure you are using today\'s code.' },
                { status: 404 }
            );
        }

        // Check if location is provided for the session
        if (!session.location || !session.location.latitude || !session.location.longitude) {
            return NextResponse.json(
                { error: 'This session does not have location verification enabled' },
                { status: 400 }
            );
        }

        // Calculate distance for debugging
        const distance = calculateDistance(
            latitude,
            longitude,
            session.location.latitude,
            session.location.longitude
        );

        console.log(`Student location: ${latitude}, ${longitude}`);
        console.log(`Session location: ${session.location.latitude}, ${session.location.longitude}`);
        console.log(`Distance: ${distance.toFixed(2)} meters`);

        // Verify location - student must be within 50 meters
        const withinRange = isWithinRange(
            latitude,
            longitude,
            session.location.latitude,
            session.location.longitude,
            50 // 50 meters
        );

        if (!withinRange) {
            return NextResponse.json(
                {
                    error: 'You are not in classroom range',
                    message: `You must be within 50 meters of the classroom to mark attendance. You are currently ${distance.toFixed(0)} meters away.`,
                    distance: Math.round(distance)
                },
                { status: 403 }
            );
        }

        // Check if student already marked attendance in this session
        const studentId = tokenUser.userId;
        if (session.attendedStudents.some((id: any) => id.toString() === studentId)) {
            return NextResponse.json(
                { message: 'Attendance already marked for this session' },
                { status: 200 }
            );
        }

        // Add student to attended list
        session.attendedStudents.push(studentId as any);
        await session.save();

        // Mark attendance in Attendance collection
        const existingAttendance = await Attendance.findOne({
            studentId,
            date: today,
        });

        if (!existingAttendance) {
            await Attendance.create({
                studentId,
                date: today,
                status: 'present',
                markedBy: session.teacherId,
            });
        } else {
            // Update to present if it was marked absent
            if (existingAttendance.status !== 'present') {
                existingAttendance.status = 'present';
                await existingAttendance.save();
            }
        }

        return NextResponse.json(
            {
                message: 'Attendance marked successfully',
                session: {
                    subject: session.subject,
                    date: session.date,
                },
                distance: Math.round(distance),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Mark attendance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
