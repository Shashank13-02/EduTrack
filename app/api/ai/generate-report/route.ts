import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Performance from '@/models/Performance';
import SkillScore from '@/models/SkillScore';
import AIReport from '@/models/AIReport';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { calculateRiskLevel } from '@/lib/riskPredictor';
import { generateComprehensiveStudentReport } from '@/lib/aiService';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Get user from request
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { studentId: requestedStudentId } = body;

        // Determine student ID
        let studentId: string;
        let teacherId: string | null = null;

        if (tokenUser.role === 'STUDENT') {
            studentId = tokenUser.userId;
        } else if (tokenUser.role === 'TEACHER') {
            if (!requestedStudentId) {
                return NextResponse.json(
                    { error: 'Student ID is required' },
                    { status: 400 }
                );
            }
            studentId = requestedStudentId;
            teacherId = tokenUser.userId;
        } else {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get student data (optimized single query with lean())
        const student = await User.findById(studentId).select('-passwordHash').lean();
        if (!student || student.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Parallel data fetching for better performance
        const [attendanceRecords, performanceRecords, skillScores] = await Promise.all([
            Attendance.find({ studentId }).lean(),
            Performance.find({ studentId }).lean(),
            SkillScore.find({ studentId }).lean()
        ]);

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

        // Prepare subject scores
        const subjectScores = performanceRecords.map((p, index) => ({
            subject: p.subjectName,
            average: subjectAverages[index]
        }));

        const weakAreas = subjectScores
            .filter(s => s.average < 60)
            .map(s => `${s.subject} (${s.average}%)`);

        // Generate comprehensive AI report
        const aiReportData = await generateComprehensiveStudentReport(
            {
                name: student.name,
                department: student.department,
                year: student.year,
                careerGoals: student.careerGoals || [],
                technicalSkills: student.skills?.filter((s: any) => s.category === 'technical' || s.category === 'project').map((s: any) => s.name) || [],
                softSkills: student.skills?.filter((s: any) => s.category === 'soft').map((s: any) => s.name) || [],
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

        if (aiReportData.error) {
            return NextResponse.json(
                { error: aiReportData.error },
                { status: 500 }
            );
        }

        // Save raw JSON string to database for full structure support
        const reportText = JSON.stringify(aiReportData);
        const recommendedPlan = aiReportData.actionPlan?.immediate || [];

        // Save to database
        const savedReport = await AIReport.create({
            studentId,
            reportText,
            recommendedPlan,
            riskLevel,
        });

        // Create notification for student (if generated by teacher)
        if (teacherId) {
            const notification = await Notification.create({
                userId: studentId,
                title: 'New AI Performance Report Available',
                message: aiReportData.teacherMessage || 'Your teacher has generated a comprehensive performance report for you.',
                type: 'AI_REPORT',
                reportId: savedReport._id,
                generatedBy: teacherId,
                link: '/student/reports',
            });

            // Send real-time notification via Socket.IO if available
            if ((global as any).io) {
                (global as any).io.to(`user:${studentId}`).emit('new-notification', {
                    type: 'AI_REPORT',
                    title: notification.title,
                    message: notification.message,
                    reportId: savedReport._id,
                    link: '/student/reports',
                });

                console.log(`📧 Sent real-time notification to student: ${studentId}`);
            }
        }

        return NextResponse.json(
            {
                message: 'AI report generated successfully',
                report: {
                    ...savedReport.toObject(),
                    fullData: aiReportData, // Include full structured data
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Generate AI report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// Helper function to format comprehensive report into readable text
function formatReportText(aiData: any): string {
    let text = '';

    if (aiData.overallAssessment) {
        text += `OVERALL ASSESSMENT:\n${aiData.overallAssessment}\n\n`;
    }

    if (aiData.strengths && aiData.strengths.length > 0) {
        text += `STRENGTHS:\n${aiData.strengths.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    }

    if (aiData.areasForImprovement && aiData.areasForImprovement.length > 0) {
        text += `AREAS FOR IMPROVEMENT:\n`;
        aiData.areasForImprovement.forEach((area: any, i: number) => {
            text += `${i + 1}. ${area.area}\n`;
            text += `   Current Status: ${area.currentStatus}\n`;
            if (area.recommendations) {
                text += `   Recommendations:\n`;
                area.recommendations.forEach((rec: string) => {
                    text += `   - ${rec}\n`;
                });
            }
            text += '\n';
        });
    }

    if (aiData.teacherMessage) {
        text += `TEACHER'S MESSAGE:\n${aiData.teacherMessage}\n`;
    }

    return text.trim();
}
