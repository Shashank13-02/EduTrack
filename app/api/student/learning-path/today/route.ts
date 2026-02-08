import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LearningPath from '@/models/LearningPath';
import DailyProgress from '@/models/DailyProgress';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Helper function to get IST date
function getISTDate(date?: Date): Date {
    const d = date || new Date();
    // Convert to IST by getting the locale string and parsing it back
    const istString = d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    return new Date(istString);
}

// Helper function to format date as YYYY-MM-DD in IST
function formatISTDate(date?: Date): string {
    const istDate = getISTDate(date);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to get start of day in IST
function getISTStartOfDay(date?: Date): Date {
    const istDate = getISTDate(date);
    istDate.setHours(0, 0, 0, 0);
    return istDate;
}

// Helper function to calculate difference in days (IST)
function differenceInDaysIST(date1: Date, date2: Date): number {
    const start1 = getISTStartOfDay(date1);
    const start2 = getISTStartOfDay(date2);
    const diffMs = start1.getTime() - start2.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = tokenUser.userId;
        const today = formatISTDate(); // Use IST date

        // Get learning path
        const learningPath = await LearningPath.findOne({ studentId });
        if (!learningPath || !learningPath.dailyRoutine || learningPath.dailyRoutine.length === 0) {
            return NextResponse.json({
                error: 'No learning path found. Please generate one first.'
            }, { status: 404 });
        }

        // Calculate day number using IST timezone - Map actual day of week
        const istDate = getISTDate();
        let dayNumber = istDate.getDay(); // 0 (Sun) to 6 (Sat)

        // Map 0 (Sunday) to 7, and ensure 1 is Monday, 2 is Tuesday, etc.
        if (dayNumber === 0) {
            dayNumber = 7;
        }

        // Note: startedAt is still useful for tracking when they began the journey overall
        // but for showing "Today's Focus", we want it to match the actual day of the week.

        // Get today's routine (map to array index 0-6)
        const dayIndex = dayNumber - 1;
        const todayRoutine = learningPath.dailyRoutine[dayIndex];

        if (!todayRoutine) {
            return NextResponse.json({
                error: 'Invalid day routine configuration'
            }, { status: 500 });
        }

        // Get or create today's progress
        let progress = await DailyProgress.findOne({ studentId, date: today });

        // Logic Fix/Reset: If progress exists but the dayNumber has changed due to our logic update,
        // we should sync it to avoid showing stale data from a different routine day.
        if (progress && progress.dayNumber !== dayNumber) {
            progress.dayNumber = dayNumber;
            // Clear tasks that might have been marked complete for a different day index
            progress.completedTasks = [];
            progress.totalTasks = todayRoutine.tasks.length;
            progress.completionRate = 0;
            await progress.save();
        }

        if (!progress) {
            progress = await DailyProgress.create({
                studentId,
                date: today,
                dayNumber,
                completedTasks: [],
                totalTasks: todayRoutine.tasks.length,
                completionRate: 0
            });
        }

        // Get user streak data
        const user = await User.findById(studentId).select('learningStreak longestStreak totalLearningDays');

        // Map tasks with completion status
        const tasksWithStatus = todayRoutine.tasks.map((task: any, index: number) => {
            const isCompleted = progress.completedTasks.some(
                (ct: any) => ct.taskId === task.taskId
            );
            const completedTask = progress.completedTasks.find(
                (ct: any) => ct.taskId === task.taskId
            );

            return {
                taskId: task.taskId,
                title: task.title,
                description: task.description,
                time: task.time,
                type: task.type,
                completed: isCompleted,
                completedAt: completedTask?.completedAt || null,
                index
            };
        });

        // Calculate LIVE stats to ensure accuracy even if DB is slightly out of sync
        const liveCompletedCount = tasksWithStatus.filter(t => t.completed).length;
        const liveTotalCount = tasksWithStatus.length;
        const livePercentage = liveTotalCount > 0 ? Math.round((liveCompletedCount / liveTotalCount) * 100) : 0;

        return NextResponse.json({
            dayNumber,
            dayName: todayRoutine.day,
            date: today,
            tasks: tasksWithStatus,
            completionStats: {
                completed: liveCompletedCount,
                total: liveTotalCount,
                percentage: livePercentage
            },
            streak: {
                current: user?.learningStreak || 0,
                longest: user?.longestStreak || 0,
                totalDays: user?.totalLearningDays || 0
            }
        });
    } catch (error) {
        console.error('Error fetching today\'s tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
