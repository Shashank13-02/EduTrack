import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Performance from '@/models/Performance';
import User from '@/models/User';
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
        const {
            studentId,
            subjectName,
            midSem1,
            midSem2,
            endSem,
            assignment,
            engagementScore,
        } = body;

        // Verify teacher's subject
        const user = await User.findById(tokenUser.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'Teacher not found' },
                { status: 404 }
            );
        }

        if (!user.subject) {
            return NextResponse.json(
                { error: 'You must have an assigned subject to grade students. Please contact administrator.' },
                { status: 403 }
            );
        }

        if (user.subject.toLowerCase().trim() !== subjectName.toLowerCase().trim()) {
            return NextResponse.json(
                { error: `You are only authorized to grade ${user.subject}. You cannot grade ${subjectName}.` },
                { status: 403 }
            );
        }

        // Validation
        if (!studentId || !subjectName) {
            return NextResponse.json(
                { error: 'Student ID and subject name are required' },
                { status: 400 }
            );
        }

        // Check if performance record exists
        const existing = await Performance.findOne({ studentId, subjectName });

        if (existing) {
            // Update existing - strictly prevent overwriting non-null values
            if (midSem1 !== undefined && existing.midSem1 === null) existing.midSem1 = midSem1;
            if (midSem2 !== undefined && existing.midSem2 === null) existing.midSem2 = midSem2;
            if (endSem !== undefined && existing.endSem === null) existing.endSem = endSem;
            if (assignment !== undefined && existing.assignment === null) existing.assignment = assignment;
            if (engagementScore !== undefined) existing.engagementScore = engagementScore;
            await existing.save();

            return NextResponse.json(
                { message: 'Performance updated', performance: existing },
                { status: 200 }
            );
        } else {
            // Create new
            const performance = await Performance.create({
                studentId,
                subjectName,
                midSem1: midSem1 || 0,
                midSem2: midSem2 || 0,
                endSem: endSem || 0,
                assignment: assignment || 0,
                engagementScore: engagementScore || 0,
            });

            return NextResponse.json(
                { message: 'Performance created', performance },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Update performance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
