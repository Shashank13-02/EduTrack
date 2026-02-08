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

        // Get teacher's profile to find their department
        const teacherProfile = await User.findById(tokenUser.userId).select('department subject').lean();
        if (!teacherProfile) {
            return NextResponse.json(
                { error: 'Teacher profile not found' },
                { status: 404 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const riskLevel = searchParams.get('riskLevel') || '';
        const sortBy = searchParams.get('sortBy') || 'name';

        // Build query - filter by STUDENT role AND teacher's department
        const query: any = {
            role: 'STUDENT',
            department: teacherProfile.department // Only show students from teacher's department
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Get all students
        const students = await User.find(query).select('-passwordHash').lean();

        // Calculate metrics for each student
        const studentsWithMetrics = await Promise.all(
            students.map(async (student) => {
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

                // Calculate engagement (average of engagement scores)
                const engagementScores = performanceRecords.map((p) => p.engagementScore);
                const engagementScore = calculateAverage(engagementScores);

                // Calculate risk level
                const riskLevelCalc = calculateRiskLevel({
                    attendancePercent,
                    averageScore,
                    engagementScore,
                });

                return {
                    ...student,
                    _id: student._id.toString(),
                    attendancePercent,
                    averageScore,
                    engagementScore,
                    riskLevel: riskLevelCalc,
                };
            })
        );

        // Filter by risk level if specified
        let filteredStudents = studentsWithMetrics;
        if (riskLevel && ['low', 'medium', 'high'].includes(riskLevel)) {
            filteredStudents = studentsWithMetrics.filter(s => s.riskLevel === riskLevel);
        }

        // Sort students
        filteredStudents.sort((a, b) => {
            switch (sortBy) {
                case 'attendance':
                    return b.attendancePercent - a.attendancePercent;
                case 'score':
                    return b.averageScore - a.averageScore;
                case 'risk':
                    const riskOrder = { high: 3, medium: 2, low: 1 };
                    return riskOrder[b.riskLevel as 'low' | 'medium' | 'high'] - riskOrder[a.riskLevel as 'low' | 'medium' | 'high'];
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return NextResponse.json({ students: filteredStudents }, { status: 200 });
    } catch (error) {
        console.error('Get students error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
