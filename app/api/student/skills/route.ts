import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SkillScore from '@/models/SkillScore';
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

        // Get skill scores
        const skillScores = await SkillScore.find({ studentId }).lean();

        return NextResponse.json({ skillScores }, { status: 200 });
    } catch (error) {
        console.error('Get skills error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
