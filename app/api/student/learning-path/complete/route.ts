import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LearningPath from '@/models/LearningPath';
import DailyProgress from '@/models/DailyProgress';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// Helper function to get IST date
function getISTDate(date?: Date): Date {
    const d = date || new Date();
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

// Helper function to subtract days from IST date
function subtractDaysIST(date: Date, days: number): string {
    const istDate = getISTDate(date);
    istDate.setDate(istDate.getDate() - days);
    return formatISTDate(istDate);
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { taskId, date } = body;

        if (!taskId) {
            return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
        }

        const studentId = tokenUser.userId;
        const todayStr = date || formatISTDate(); // Use IST date

        // Get learning path to find task details
        const learningPath = await LearningPath.findOne({ studentId });
        if (!learningPath) {
            return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
        }

        // Find the task in the learning path
        let taskFound = false;
        let taskIndex = -1;
        for (const dayRoutine of learningPath.dailyRoutine) {
            const foundTask = dayRoutine.tasks.findIndex((t: any) => t.taskId === taskId);
            if (foundTask !== -1) {
                taskFound = true;
                taskIndex = foundTask;
                break;
            }
        }

        if (!taskFound) {
            return NextResponse.json({ error: 'Task not found in your routine' }, { status: 404 });
        }

        // Get or create specified day's progress
        let progress = await DailyProgress.findOne({ studentId, date: todayStr });

        if (!progress) {
            // Calculate day number using same logic as today route with IST - Map actual day of week
            const istDate = getISTDate(new Date(todayStr));
            let dayNumber = istDate.getDay();
            if (dayNumber === 0) dayNumber = 7;

            const todayRoutine = learningPath.dailyRoutine[(dayNumber - 1)] || learningPath.dailyRoutine[0];
            progress = new DailyProgress({
                studentId,
                date: todayStr,
                dayNumber,
                completedTasks: [],
                totalTasks: todayRoutine.tasks.length,
                completionRate: 0
            });
        }

        if (!progress) {
            throw new Error('Failed to initialize progress object');
        }

        // Toggle task completion
        const existingTaskIndex = progress.completedTasks.findIndex(
            (ct: any) => ct.taskId === taskId
        );

        let streakUpdated = false;
        const wasEmpty = progress.completedTasks.length === 0;

        if (existingTaskIndex !== -1) {
            // Uncomplete task
            progress.completedTasks.splice(existingTaskIndex, 1);
        } else {
            // Complete task
            progress.completedTasks.push({
                taskId,
                taskIndex,
                completedAt: new Date()
            });

            // Update streak ONLY if this is the very first task completed today
            if (wasEmpty) {
                await updateStreak(studentId, todayStr);
                streakUpdated = true;
            }
        }

        // Recalculate completion rate
        progress.completionRate = progress.totalTasks > 0
            ? Math.round((progress.completedTasks.length / progress.totalTasks) * 100)
            : 0;

        await progress.save();

        // Get updated user data for streak
        const user = await User.findById(studentId).select('learningStreak');

        return NextResponse.json({
            success: true,
            task: { taskId, completed: existingTaskIndex === -1 },
            updatedStats: {
                completionRate: progress.completionRate,
                streakUpdated,
                newStreak: user?.learningStreak || 0
            }
        });
    } catch (error: any) {
        console.error('Error completing task:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}

// Helper function to update user's learning streak
async function updateStreak(studentId: string, todayStr: string) {
    const yesterday = subtractDaysIST(new Date(todayStr), 1);

    // Check if user completed tasks yesterday
    const yesterdayProgress = await DailyProgress.findOne({
        studentId,
        date: yesterday,
        completionRate: { $gt: 0 }
    });

    const user = await User.findById(studentId);
    if (!user) return;

    if (yesterdayProgress) {
        // Continue streak
        user.learningStreak = (user.learningStreak || 0) + 1;
    } else {
        // Check if there's a gap - if so, reset streak
        const twoDaysAgo = subtractDaysIST(new Date(todayStr), 2);
        const twoDaysProgress = await DailyProgress.findOne({
            studentId,
            date: twoDaysAgo,
            completionRate: { $gt: 0 }
        });

        if (!twoDaysProgress && (user.learningStreak || 0) > 0) {
            // Gap detected, restart streak
            user.learningStreak = 1;
        } else if ((user.learningStreak || 0) === 0) {
            // First day
            user.learningStreak = 1;
        }
    }

    // Update longest streak
    if ((user.learningStreak || 0) > (user.longestStreak || 0)) {
        user.longestStreak = user.learningStreak;
    }

    // Increment total learning days
    user.totalLearningDays = (user.totalLearningDays || 0) + 1;

    await user.save();
}
