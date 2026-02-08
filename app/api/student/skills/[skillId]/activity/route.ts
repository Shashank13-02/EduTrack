import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import {
    XP_PER_ACTIVITY,
    calculateLevel,
    updateStreakLogic,
    checkDailyActivityExists,
} from '@/lib/skillProgress';

/**
 * POST - Log a new activity for a skill
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    try {
        await connectDB();

        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { skillId } = await params;
        const body = await request.json();
        const { timeSpent = 0, notes = '' } = body;

        // Validate input
        if (timeSpent < 0) {
            return NextResponse.json(
                { error: 'Time spent cannot be negative' },
                { status: 400 }
            );
        }

        // Find user and skill
        const user = await User.findById(tokenUser.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const skillIndex = user.skills.findIndex(
            (s: any) => s._id.toString() === skillId
        );

        if (skillIndex === -1) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        const skill: any = user.skills[skillIndex];

        // Check if activity already logged today
        const activityDate = new Date();
        if (checkDailyActivityExists(skill.activities || [], activityDate)) {
            return NextResponse.json(
                {
                    error: 'Activity already logged for today',
                    alreadyLogged: true,
                },
                { status: 400 }
            );
        }

        // Calculate XP gain
        const xpGained = XP_PER_ACTIVITY;
        const newTotalXP = skill.xp + xpGained;

        // Calculate new level
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel > skill.level;

        // Update streak
        const streakUpdate = updateStreakLogic(
            skill.lastPracticed,
            activityDate,
            skill.streak || 0
        );

        // Update best streak if needed
        const newBestStreak = Math.max(
            skill.bestStreak || 0,
            streakUpdate.newStreak
        );

        // Create new activity
        const newActivity = {
            date: activityDate,
            timeSpent: Number(timeSpent),
            notes: notes.trim(),
            xpGained,
        };

        // Update skill - preserve all required fields
        user.skills[skillIndex] = {
            _id: skill._id,
            name: skill.name,
            category: skill.category,
            level: newLevel,
            xp: newTotalXP,
            addedDate: skill.addedDate,
            lastPracticed: activityDate,
            streak: streakUpdate.newStreak,
            bestStreak: newBestStreak,
            milestones: skill.milestones || [],
            activities: [...(skill.activities || []), newActivity],
        } as any;

        // Add milestone if leveled up
        if (leveledUp) {
            user.skills[skillIndex].milestones.push({
                date: activityDate,
                description: `Reached Level ${newLevel}`,
                xpGained,
            });
        }

        await user.save();

        // Format skill for response
        const updatedSkill: any = user.skills[skillIndex];

        return NextResponse.json(
            {
                message: 'Activity logged successfully',
                skill: {
                    _id: updatedSkill._id?.toString(),
                    name: updatedSkill.name,
                    category: updatedSkill.category,
                    level: updatedSkill.level,
                    xp: updatedSkill.xp,
                    streak: updatedSkill.streak,
                    bestStreak: updatedSkill.bestStreak,
                    lastPracticed: updatedSkill.lastPracticed,
                    addedDate: updatedSkill.addedDate,
                    activities: updatedSkill.activities || [],
                    milestones: updatedSkill.milestones || [],
                },
                leveledUp,
                streakContinued: streakUpdate.streakContinued,
                xpGained,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Log activity error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET - Retrieve activity history for a skill
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    try {
        await connectDB();

        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { skillId } = await params;

        // Find user and skill
        const user = await User.findById(tokenUser.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const skill: any = user.skills.find((s: any) => s._id.toString() === skillId);

        if (!skill) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        // Return skill with full activity history
        return NextResponse.json(
            {
                skill: {
                    _id: skill._id?.toString(),
                    name: skill.name,
                    category: skill.category,
                    level: skill.level,
                    xp: skill.xp,
                    streak: skill.streak,
                    bestStreak: skill.bestStreak,
                    lastPracticed: skill.lastPracticed,
                    addedDate: skill.addedDate,
                    activities: (skill.activities || []).sort(
                        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    ),
                    milestones: skill.milestones,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get activity history error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
