import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AttendanceSession from '@/models/AttendanceSession';
import Attendance from '@/models/Attendance';
import { getUserFromRequest } from '@/lib/auth';
import QRCode from 'qrcode';

// Helper to get current time in IST (GMT+5.30)
function getISTDate(): Date {
    const now = new Date();
    // If the server is already in IST or the desired local time, this is fine.
    // However, to be safe on UTC servers, we can adjust.
    // For this hackathon, we'll assume IST is the target.
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(utcTime + istOffset);
}

// Generate unique daily session code with date stamp
function generateDailySessionCode(): string {
    const today = getISTDate();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear().toString().slice(-2)}`;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${dateStr}-${randomPart}`; // Format: DDMMYY-XXXX
}

// Check if date is today (in IST)
function isToday(date: Date): boolean {
    const istNow = getISTDate();
    const checkDate = new Date(date);

    // Convert checkDate to IST for comparison if it's stored in UTC
    const utcCheck = checkDate.getTime() + (checkDate.getTimezoneOffset() * 60000);
    const istCheck = new Date(utcCheck + (5.5 * 60 * 60 * 1000));

    return istCheck.getDate() === istNow.getDate() &&
        istCheck.getMonth() === istNow.getMonth() &&
        istCheck.getFullYear() === istNow.getFullYear();
}

// POST: Start a new attendance session
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
        const { subject, latitude, longitude } = body;

        // Validate location if provided
        if (latitude !== undefined && longitude !== undefined) {
            if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                return NextResponse.json(
                    { error: 'Invalid location coordinates' },
                    { status: 400 }
                );
            }
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                return NextResponse.json(
                    { error: 'Location coordinates out of range' },
                    { status: 400 }
                );
            }
        }

        // Check if there's already an active session TODAY
        const existingSession = await AttendanceSession.findOne({
            teacherId: tokenUser.userId,
            isActive: true,
        });

        if (existingSession) {
            // Check if the existing session is from today
            if (isToday(existingSession.date)) {
                return NextResponse.json(
                    { error: 'You already have an active attendance session today' },
                    { status: 400 }
                );
            } else {
                // Auto-close old session from previous days
                existingSession.isActive = false;
                existingSession.endTime = new Date();
                await existingSession.save();
            }
        }

        // Auto-close any other active sessions from previous days
        await AttendanceSession.updateMany(
            {
                isActive: true,
                date: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) }
            },
            {
                $set: {
                    isActive: false,
                    endTime: new Date()
                }
            }
        );

        // Generate unique daily session code
        let sessionCode = generateDailySessionCode();
        let exists = await AttendanceSession.findOne({ sessionCode });
        while (exists) {
            sessionCode = generateDailySessionCode();
            exists = await AttendanceSession.findOne({ sessionCode });
        }

        // Create today's date at midnight IST for consistency
        const istNow = getISTDate();
        const today = new Date(istNow);
        today.setHours(0, 0, 0, 0);

        // Create session
        const session = await AttendanceSession.create({
            teacherId: tokenUser.userId,
            sessionCode,
            subject,
            date: today,
            startTime: new Date(),
            isActive: true,
            attendedStudents: [],
            location: (latitude !== undefined && longitude !== undefined) ? {
                latitude,
                longitude,
            } : undefined,
        });

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(sessionCode, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
        });

        return NextResponse.json(
            {
                message: 'Attendance session started',
                session: {
                    _id: session._id,
                    sessionCode: session.sessionCode,
                    subject: session.subject,
                    startTime: session.startTime,
                    date: session.date,
                    location: session.location,
                    attendedStudents: [],
                },
                qrCode: qrCodeDataURL,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Start attendance session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Get active session (TODAY ONLY)
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

        // Get today's date at midnight IST
        const istNow = getISTDate();
        const today = new Date(istNow);
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find active session for TODAY only
        const session = await AttendanceSession.findOne({
            teacherId: tokenUser.userId,
            isActive: true,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('attendedStudents', 'name email');

        if (!session) {
            // Auto-close any lingering active sessions from previous days
            await AttendanceSession.updateMany(
                {
                    teacherId: tokenUser.userId,
                    isActive: true,
                    date: { $lt: today }
                },
                {
                    $set: {
                        isActive: false,
                        endTime: new Date()
                    }
                }
            );

            return NextResponse.json(
                { message: 'No active session today' },
                { status: 200 }
            );
        }

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(session.sessionCode, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
        });

        return NextResponse.json(
            { session, qrCode: qrCodeDataURL },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get active session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH: End session
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get today's date range in IST
        const istNow = getISTDate();
        const today = new Date(istNow);
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const session = await AttendanceSession.findOne({
            teacherId: tokenUser.userId,
            isActive: true,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'No active session found today' },
                { status: 404 }
            );
        }

        // Mark all attended students as present for today
        for (const studentId of session.attendedStudents) {
            const existing = await Attendance.findOne({
                studentId,
                date: today,
            });

            if (!existing) {
                await Attendance.create({
                    studentId,
                    date: today,
                    status: 'present',
                    markedBy: tokenUser.userId,
                });
            }
        }

        // End session
        session.isActive = false;
        session.endTime = new Date();
        await session.save();

        return NextResponse.json(
            {
                message: 'Session ended successfully',
                attendedCount: session.attendedStudents.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('End session error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
