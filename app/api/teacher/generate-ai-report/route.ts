import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Performance from '@/models/Performance';

import Attendance from '@/models/Attendance';
import AIReport from '@/models/AIReport';
import Notification from '@/models/Notification';
import { generateComprehensiveStudentReport } from '@/lib/aiService';
import { predictRiskLevel } from '@/lib/riskPredictor';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get teacher session
        const session = await getSession(request);
        if (!session || session.role.toLowerCase() !== 'teacher') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        // Fetch student data
        const student = await User.findById(studentId);
        if (!student || student.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Fetch performance data
        const performanceRecords = await Performance.find({ studentId }).sort({ createdAt: -1 });
        const attendanceRecords = await Attendance.find({ studentId });

        // Calculate metrics
        const totalAttendance = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
        const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        const avgScores = performanceRecords.map(p => {
            const total = (p.midSem1 ?? 0) + (p.midSem2 ?? 0) + (p.endSem ?? 0) + (p.assignment ?? 0);
            return total;
        });
        const averageScore = avgScores.length > 0
            ? Math.round(avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length)
            : 0;

        const engagementScores = performanceRecords.map((p) => p.engagementScore);
        const engagementScore = engagementScores.length > 0
            ? Math.round(engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length)
            : 50;
        const riskLevel = predictRiskLevel(attendancePercent, averageScore, engagementScore);

        // Prepare subject scores
        const subjectScores = performanceRecords.map(p => ({
            subject: p.subjectName,
            average: (p.midSem1 ?? 0) + (p.midSem2 ?? 0) + (p.endSem ?? 0) + (p.assignment ?? 0)
        }));

        // Identify weak areas (subjects with < 60%)
        const weakAreas = subjectScores
            .filter(s => s.average < 60)
            .map(s => `${s.subject} (${s.average}%)`);

        // Generate AI report
        const reportData = await generateComprehensiveStudentReport(
            {
                name: student.name,
                department: student.department,
                year: student.year,
                careerGoals: student.careerGoals || [],
                technicalSkills: (student as any).skills?.filter((s: any) => s.category === 'technical' || s.category === 'project').map((s: any) => s.name) || [],
                softSkills: (student as any).skills?.filter((s: any) => s.category === 'soft').map((s: any) => s.name) || [],
            },
            {
                attendancePercent,
                averageScore,
                engagementScore,
                riskLevel,
                subjectScores,
                weakAreas,
            }
        );

        if (reportData.error) {
            return NextResponse.json({ error: reportData.error }, { status: 500 });
        }

        // Save report to database
        const aiReport = new AIReport({
            studentId,
            reportText: JSON.stringify(reportData),
            recommendedPlan: reportData.actionPlan?.immediate || [],
            riskLevel: riskLevel,
        });
        await aiReport.save();

        // Create notification for student
        const notification = new Notification({
            userId: studentId,
            title: 'New AI Performance Report Available',
            message: `Your teacher has generated a comprehensive performance report for you. ${reportData.teacherMessage || 'Check it out to see your progress and recommendations!'}`,
            type: 'AI_REPORT',
            reportId: aiReport._id,
            generatedBy: session.userId,
            link: '/student/reports',
        });
        await notification.save();

        return NextResponse.json({
            success: true,
            reportId: aiReport._id,
            message: 'AI report generated and sent to student successfully',
        });
    } catch (error: any) {
        console.error('Error generating AI report:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI report', details: error.message },
            { status: 500 }
        );
    }
}
