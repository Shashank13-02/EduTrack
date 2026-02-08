import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import SkillScore from '@/models/SkillScore';
import AIReport from '@/models/AIReport';
import { getUserFromRequest } from '@/lib/auth';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { calculateRiskLevel } from '@/lib/riskPredictor';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: studentId } = await params;
    try {
        await dbConnect();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role.toLowerCase() !== 'teacher') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parallel data fetching for better performance - fetch all data concurrently
        const [student, attendanceRecords, performanceRecords, skillScores, latestReport] = await Promise.all([
            User.findById(studentId).select('-passwordHash').lean(),
            Attendance.find({ studentId }).sort({ date: -1 }).lean(),
            Performance.find({ studentId }).lean(),
            SkillScore.find({ studentId }).lean(),
            AIReport.findOne({ studentId }).sort({ createdAt: -1 }).lean()
        ]);

        if (!student || student.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Calculate metrics
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(
            (a) => a.status === 'present' || a.status === 'late'
        ).length;
        const attendancePercent = calculatePercentage(presentDays, totalDays);

        // Calculate student average using weighted components
        const subjectAverages = performanceRecords.map(p => {
            return calculateWeightedAverage([
                { score: p.midSem1 || 0, max: 10 },
                { score: p.midSem2 || 0, max: 10 },
                { score: p.endSem || 0, max: 70 },
                { score: p.assignment || 0, max: 10 }
            ]);
        });

        const averageScore = calculateAverage(subjectAverages);

        const engagementScores = performanceRecords.map((p) => p.engagementScore);
        const engagementScore = calculateAverage(engagementScores);

        const riskLevel = calculateRiskLevel({
            attendancePercent,
            averageScore,
            engagementScore,
        });

        return NextResponse.json(
            {
                student: {
                    ...student,
                    _id: student._id.toString(),
                },
                attendancePercent,
                averageScore,
                engagementScore,
                riskLevel,
                attendanceRecords,
                performanceRecords,
                skillScores,
                latestReport,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get student details error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
