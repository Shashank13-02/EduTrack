import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import AttendanceSession from '@/models/AttendanceSession';
import Performance from '@/models/Performance';
import SkillScore from '@/models/SkillScore';
import AIReport from '@/models/AIReport';
import { getUserFromRequest } from '@/lib/auth';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { calculateRiskLevel } from '@/lib/riskPredictor';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Check auth
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role.toLowerCase() !== 'student') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const studentId = tokenUser.userId;

        // Get student
        const student = await User.findById(studentId).select('-passwordHash').lean();
        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Get attendance
        const attendanceRecords = await Attendance.find({ studentId })
            .sort({ date: -1 })
            .lean();
        
        // Calculate monthly attendance based on sessions
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        currentMonthEnd.setHours(23, 59, 59, 999);
        
        // Get all attendance sessions in current month (classes held)
        const sessionsInMonth = await AttendanceSession.find({
            date: {
                $gte: currentMonthStart,
                $lte: currentMonthEnd
            },
            isActive: false // Only count completed sessions
        }).lean();
        
        // Get attendance records for current month
        const monthlyAttendanceRecords = attendanceRecords.filter((record) => {
            const recordDate = new Date(record.date);
            return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
        });
        
        // Calculate monthly attendance
        // Ensure totalClassesInMonth is at least as large as the student's records to avoid >100%
        const totalClassesInMonth = Math.max(sessionsInMonth.length, monthlyAttendanceRecords.length) || 1;
        const presentDays = monthlyAttendanceRecords.filter(
            (a) => a.status === 'present' || a.status === 'late'
        ).length;
        const attendancePercent = calculatePercentage(presentDays, totalClassesInMonth);
        
        // Also calculate overall attendance (for backward compatibility)
        const totalDays = attendanceRecords.length;
        const overallPresentDays = attendanceRecords.filter(
            (a) => a.status === 'present' || a.status === 'late'
        ).length;
        const overallAttendancePercent = calculatePercentage(overallPresentDays, totalDays);

        // Get performance
        const performanceRecords = await Performance.find({ studentId }).lean();

        // Calculate dynamic average across all subjects
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

        // Get skills
        const skillScores = await SkillScore.find({ studentId }).lean();

        // Get latest AI report
        const latestReport = await AIReport.findOne({ studentId })
            .sort({ createdAt: -1 })
            .lean();

        // Calculate risk level
        const riskLevel = calculateRiskLevel({
            attendancePercent,
            averageScore,
            engagementScore,
        });

        return NextResponse.json(
            {
                student,
                attendancePercent, // Monthly attendance percentage
                overallAttendancePercent, // Overall attendance percentage
                totalClassesInMonth, // Total classes in current month
                attendanceRecords, // Include full attendance records for calendar
                averageScore,
                engagementScore, // Include engagement score
                riskLevel,
                performanceRecords,
                skillScores,
                latestReport,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get student data error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
