import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Performance from '@/models/Performance';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const subjectName = searchParams.get('subjectName');

        // Verify teacher's subject
        const user = await User.findById(tokenUser.userId);
        if (!user || user.subject !== subjectName) {
            return NextResponse.json(
                { error: `You are only authorized to grade ${user?.subject || 'your assigned subject'}` },
                { status: 403 }
            );
        }

        if (!subjectName) {
            return NextResponse.json(
                { error: 'Subject name is required' },
                { status: 400 }
            );
        }

        const performanceRecords = await Performance.find({ subjectName }).lean();

        return NextResponse.json({ performanceRecords }, { status: 200 });
    } catch (error) {
        console.error('Get marks error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
        const { subjectName, marksUpdates } = body;

        // Verify teacher's subject
        const user = await User.findById(tokenUser.userId);
        if (!user || user.subject !== subjectName) {
            return NextResponse.json(
                { error: `You are only authorized to grade ${user?.subject || 'your assigned subject'}` },
                { status: 403 }
            );
        }

        if (!subjectName || !marksUpdates || !Array.isArray(marksUpdates)) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        // marksUpdates: [{ studentId, midSem1, midSem2, endSem, assignment }]
        const results = [];
        const updateType = getUpdateType(marksUpdates[0]);

        for (const update of marksUpdates) {
            const { studentId, ...scores } = update;

            // Validate marks values
            const validationError = validateMarks(scores);
            if (validationError) {
                console.error('Validation error:', validationError);
                continue;
            }

            try {
                // Check if mark component already exists and is not null
                const existing = await Performance.findOne({ studentId, subjectName });
                if (existing) {
                    const fieldToUpdate = Object.keys(scores)[0]; // Since it's usually one type at a time from the UI
                    if ((existing as any)[fieldToUpdate] !== null) {
                        console.error(`Attempt to overwrite existing marks for ${fieldToUpdate} for student ${studentId}`);
                        continue; // Skip this student if mark already exists
                    }
                }

                // Update or Create performance record
                const performance = await Performance.findOneAndUpdate(
                    { studentId, subjectName },
                    { $set: scores },
                    { new: true, upsert: true }
                );

                // Create Notification only if marks are not null
                if (updateType) {
                    await Notification.create({
                        userId: studentId,
                        title: 'New Marks Published',
                        message: `Marks for ${updateType} have been published for ${subjectName}.`,
                        type: 'MARKS_PUBLISHED',
                        link: '/student/dashboard',
                    });
                }

                results.push(performance);
            } catch (studentError) {
                console.error(`Error updating marks for student ${studentId}:`, studentError);
                // Continue with other students
            }
        }

        return NextResponse.json(
            { message: 'Marks published successfully', count: results.length, results },
            { status: 200 }
        );
    } catch (error) {
        console.error('Publish marks error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

function validateMarks(scores: any): string | null {
    const limits = { midSem1: 10, midSem2: 10, endSem: 70, assignment: 10 };

    for (const [field, value] of Object.entries(scores)) {
        if (value !== null && value !== undefined) {
            const max = limits[field as keyof typeof limits];
            if (typeof value !== 'number' || value < 0 || (max && value > max)) {
                return `Invalid value for ${field}`;
            }
        }
    }
    return null;
}

function getUpdateType(update: any): string {
    const fields = ['midSem1', 'midSem2', 'endSem', 'assignment'];
    const labels: { [key: string]: string } = {
        midSem1: 'Mid-Sem 1',
        midSem2: 'Mid-Sem 2',
        endSem: 'End Semester',
        assignment: 'Assignment'
    };

    for (const field of fields) {
        if (update[field] !== undefined && update[field] !== null) {
            return labels[field];
        }
    }
    return '';
}
