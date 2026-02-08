import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import { getUserFromRequest } from '@/lib/auth';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { calculateRiskLevel } from '@/lib/riskPredictor';

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
        const students = await User.find({ role: 'STUDENT' }).lean();
        const totalStudents = students.length;

        // Calculate metrics for all students
        let totalAttendancePercent = 0;
        let totalScore = 0;
        const riskCounts = { low: 0, medium: 0, high: 0 };

        for (const student of students) {
            const studentId = student._id;

            // Get attendance
            const attendanceRecords = await Attendance.find({ studentId }).lean();
            const totalDays = attendanceRecords.length;
            const presentDays = attendanceRecords.filter(
                (a) => a.status === 'present' || a.status === 'late'
            ).length;
            const attendancePercent = calculatePercentage(presentDays, totalDays);
            totalAttendancePercent += attendancePercent;

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
            totalScore += averageScore;

            // Calculate engagement
            const engagementScores = performanceRecords.map((p) => p.engagementScore);
            const engagementScore = calculateAverage(engagementScores);

            // Calculate risk level
            const riskLevel = calculateRiskLevel({
                attendancePercent,
                averageScore,
                engagementScore,
            });

            riskCounts[riskLevel as 'low' | 'medium' | 'high']++;
        }

        const avgAttendance = totalStudents > 0 ? Math.round(totalAttendancePercent / totalStudents) : 0;
        const avgPerformance = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

        return NextResponse.json(
            {
                totalStudents,
                avgAttendance,
                avgPerformance,
                riskDistribution: riskCounts,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get class overview error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
