import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DailyProgress from '@/models/DailyProgress';
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

// Helper function to subtract days from IST date
function subtractDaysIST(date: Date, days: number): string {
    const istDate = getISTDate(date);
    istDate.setDate(istDate.getDate() - days);
    return formatISTDate(istDate);
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = tokenUser.userId;

        // Get last 7 days of progress using IST dates
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const date = subtractDaysIST(new Date(), i);
            const progress = await DailyProgress.findOne({ studentId, date });

            weekData.push({
                date,
                dayNumber: progress?.dayNumber || 0,
                completionRate: progress?.completionRate || 0,
                tasksCompleted: progress?.completedTasks.length || 0,
                totalTasks: progress?.totalTasks || 0
            });
        }

        // Calculate weekly statistics
        const totalTasksCompleted = weekData.reduce((sum, day) => sum + day.tasksCompleted, 0);
        const totalTasks = weekData.reduce((sum, day) => sum + day.totalTasks, 0);
        const weeklyAverage = totalTasks > 0
            ? Math.round((totalTasksCompleted / totalTasks) * 100)
            : 0;

        // Generate AI insights based on progress
        const insights = generateInsights(weekData);

        return NextResponse.json({
            weekData,
            weeklyAverage,
            totalTasksCompleted,
            totalTasks,
            insights
        });
    } catch (error) {
        console.error('Error generating weekly report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function generateInsights(weekData: any[]): string {
    const completedDays = weekData.filter(d => d.completionRate > 0).length;
    const avgCompletion = weekData.reduce((sum, d) => sum + d.completionRate, 0) / 7;
    const perfectDays = weekData.filter(d => d.completionRate === 100).length;

    if (completedDays === 7) {
        return `🌟 Amazing! You've been active all 7 days this week. ${perfectDays > 0 ? `You achieved ${perfectDays} perfect day${perfectDays > 1 ? 's' : ''}!` : 'Keep up the excellent consistency!'}`;
    } else if (completedDays >= 5) {
        return `🔥 Great consistency this week! You've maintained a ${completedDays}-day streak. Try to reach all 7 days next week!`;
    } else if (completedDays >= 3) {
        return `👍 Good progress! You've been active ${completedDays} days this week. Aim for 5+ days to build a strong habit.`;
    } else if (completedDays > 0) {
        return `📈 You've started your learning journey! Try to be consistent with at least 3-4 days per week for better results.`;
    } else {
        return `💪 Time to get started! Set aside some time each day to work on your learning goals.`;
    }
}
