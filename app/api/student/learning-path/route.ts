import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LearningPath from '@/models/LearningPath';
import User from '@/models/User';
import Performance from '@/models/Performance';
import Attendance from '@/models/Attendance';
import SkillScore from '@/models/SkillScore';
import { getUserFromRequest } from '@/lib/auth';
import { generateLearningPath } from '@/lib/aiService';
import { calculatePercentage, calculateAverage, calculateWeightedAverage } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let path = await LearningPath.findOne({ studentId: tokenUser.userId });

        // Migration: Add taskIds if they don't exist
        if (path && path.dailyRoutine && path.dailyRoutine.length > 0) {
            let needsUpdate = false;

            const updatedRoutine = path.dailyRoutine.map((day: any) => {
                const updatedTasks = day.tasks.map((task: any) => {
                    if (!task.taskId) {
                        needsUpdate = true;
                        return { ...task.toObject(), taskId: uuidv4() };
                    }
                    return task;
                });
                return { ...day.toObject(), tasks: updatedTasks };
            });

            if (needsUpdate) {
                path.dailyRoutine = updatedRoutine;
                await path.save();
            }
        }

        return NextResponse.json({ path });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = tokenUser.userId;

        // Gather all data for AI
        const student = await User.findById(studentId).lean();
        const attendanceRecords = await Attendance.find({ studentId }).lean();
        const performanceRecords = await Performance.find({ studentId }).lean();

        // Calculations
        const attendancePercent = calculatePercentage(
            attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length,
            attendanceRecords.length
        );

        const subjectAverages = performanceRecords.map(p => calculateWeightedAverage([
            { score: p.midSem1 || 0, max: 10 },
            { score: p.midSem2 || 0, max: 10 },
            { score: p.endSem || 0, max: 70 },
            { score: p.assignment || 0, max: 10 }
        ]));
        const averageScore = calculateAverage(subjectAverages);
        const engagementScore = calculateAverage(performanceRecords.map(p => p.engagementScore));

        const aiInput = {
            ...student,
            attendancePercent,
            averageScore,
            engagementScore,
            technicalSkills: (student as any).skills?.filter((s: any) => s.category === 'technical' || s.category === 'project').map((s: any) => s.name) || [],
            softSkills: (student as any).skills?.filter((s: any) => s.category === 'soft').map((s: any) => s.name) || [],
        };

        const aiResponse = await generateLearningPath(aiInput);
        if (aiResponse.error) {
            return NextResponse.json({ error: aiResponse.error }, { status: 500 });
        }

        // Add unique taskIds to each task
        const dailyRoutineWithIds = aiResponse.dailyRoutine.map((day: any) => ({
            ...day,
            tasks: day.tasks.map((task: any) => ({
                ...task,
                taskId: uuidv4()
            }))
        }));

        // Check if this is first generation
        const existingPath = await LearningPath.findOne({ studentId });
        const isFirstGeneration = !existingPath;

        const updatedPath = await LearningPath.findOneAndUpdate(
            { studentId },
            {
                $set: {
                    dailyRoutine: dailyRoutineWithIds,
                    lastUpdated: new Date(),
                    ...(isFirstGeneration && { startedAt: new Date() })
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Learning path generated', path: updatedPath });
    } catch (error) {
        console.error('Learning path generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
