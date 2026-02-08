import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const student = await User.findById(tokenUser.userId).select('bio skills careerGoals hobbies department year name email image').lean();
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Ensure skills is an array (backward compatibility)
        if (!student.skills) {
            student.skills = [];
        }

        return NextResponse.json({ student });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bio, skills, careerGoals, hobbies, image } = body;

        // Validate skills array if provided
        if (skills && !Array.isArray(skills)) {
            return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 });
        }

        // Ensure new skills have proper default values
        const processedSkills = skills ? skills.map((skill: any) => ({
            ...skill,
            level: skill.level || 1,
            xp: skill.xp || 0,
            streak: skill.streak || 0,
            bestStreak: skill.bestStreak || 0,
            milestones: skill.milestones || [],
            activities: skill.activities || [],
            addedDate: skill.addedDate || new Date(),
            lastPracticed: skill.lastPracticed || new Date(),
        })) : undefined;

        const updatedStudent = await User.findByIdAndUpdate(
            tokenUser.userId,
            {
                $set: {
                    ...(bio !== undefined && { bio }),
                    ...(processedSkills !== undefined && { skills: processedSkills }),
                    ...(careerGoals !== undefined && { careerGoals }),
                    ...(hobbies !== undefined && { hobbies }),
                    ...(image !== undefined && { image })
                }
            },
            { new: true }
        ).select('-passwordHash');

        return NextResponse.json({ message: 'Profile updated successfully', student: updatedStudent });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
