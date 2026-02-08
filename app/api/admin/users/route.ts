import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const currentUser = await getUserFromRequest(request);
        if (!currentUser){
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await User.find(
            { role: { $in: ['TEACHER', 'STUDENT'] } },
            'name email role department year yearsTaught subject isVerified createdAt'
        )
            .sort({ createdAt: -1 })
            .lean();

        const teachers = users.filter((u:any) => u.role === 'TEACHER');
        const students = users.filter((u:any) => u.role === 'STUDENT');

        return NextResponse.json({
            teachers,
            students,
            stats: {
                totalTeachers: teachers.length,
                totalStudents: students.length,
                verifiedTeachers: teachers.filter((t:any) => t.isVerified).length,
                verifiedStudents: students.filter((s:any) => s.isVerified).length,
            },
        });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

