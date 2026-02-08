import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import { getUserFromRequest } from '@/lib/auth';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { calculateRiskLevel } from '@/lib/riskPredictor';

interface AtRiskStudent {
    student: any;
    attendancePercent: number;
    averageScore: number;
    engagementScore: number;
    riskLevel: string;
    reasons: string[];
    interventions: string[];
}

export async function GET(request: NextRequest) {
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

        // Get all students
        const students = await User.find({ role: 'STUDENT' }).select('-passwordHash').lean();

        const atRiskStudents: AtRiskStudent[] = [];

        for (const student of students) {
            const studentId = student._id;

            // Get attendance
            const attendanceRecords = await Attendance.find({ studentId }).lean();
            const totalDays = attendanceRecords.length;
            const presentDays = attendanceRecords.filter(
                (a) => a.status === 'present' || a.status === 'late'
            ).length;
            const attendancePercent = calculatePercentage(presentDays, totalDays);

            // Get performance
            const performanceRecords = await Performance.find({ studentId }).lean();

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

            // Calculate engagement
            const engagementScores = performanceRecords.map((p) => p.engagementScore);
            const engagementScore = calculateAverage(engagementScores);

            // Calculate risk level
            const riskLevel = calculateRiskLevel({
                attendancePercent,
                averageScore,
                engagementScore,
            });

            // Only include medium and high risk students
            if (riskLevel === 'medium' || riskLevel === 'high') {
                const reasons: string[] = [];
                const interventions: string[] = [];

                // Identify reasons
                if (attendancePercent < 75) {
                    reasons.push(`Low attendance: ${attendancePercent}%`);
                    interventions.push('Schedule parent meeting to discuss attendance');
                    interventions.push('Provide flexible attendance options if needed');
                }

                if (averageScore < 60) {
                    reasons.push(`Low academic performance: ${averageScore}%`);
                    interventions.push('Arrange extra tutoring sessions');
                    interventions.push('Provide additional practice assignments');
                }

                if (engagementScore < 50) {
                    reasons.push(`Low engagement: ${engagementScore}%`);
                    interventions.push('One-on-one mentoring session');
                    interventions.push('Assign peer study group');
                }

                if (reasons.length === 0) {
                    reasons.push('Multiple factors contributing to risk');
                    interventions.push('Comprehensive academic review session');
                }

                atRiskStudents.push({
                    student,
                    attendancePercent,
                    averageScore,
                    engagementScore,
                    riskLevel,
                    reasons,
                    interventions,
                });
            }
        }

        // Sort by risk level (high first) and then by average score (lowest first)
        atRiskStudents.sort((a, b) => {
            if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
            if (a.riskLevel !== 'high' && b.riskLevel === 'high') return 1;
            return a.averageScore - b.averageScore;
        });

        return NextResponse.json(
            { atRiskStudents, count: atRiskStudents.length },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get risk alerts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
