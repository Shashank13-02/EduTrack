import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CareerRoadmap from '@/models/CareerRoadmap';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { generateCareerRoadmap } from '@/lib/aiService';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const tokenUser = await getUserFromRequest(request);
        if (!tokenUser || tokenUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roadmap = await CareerRoadmap.findOne({ studentId: tokenUser.userId });
        return NextResponse.json({ roadmap });
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
        const student = await User.findById(studentId).lean();

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const aiInput = {
            ...student,
            technicalSkills: (student as any).skills?.filter((s: any) => s.category === 'technical' || s.category === 'project').map((s: any) => s.name) || [],
            softSkills: (student as any).skills?.filter((s: any) => s.category === 'soft').map((s: any) => s.name) || [],
        };

        const aiResponse = await generateCareerRoadmap(aiInput);
        if (aiResponse.error) {
            return NextResponse.json({ error: aiResponse.error }, { status: 500 });
        }

        const updatedRoadmap = await CareerRoadmap.findOneAndUpdate(
            { studentId },
            {
                $set: {
                    department: student.department,
                    roadmaps: [
                        {
                            title: aiResponse.roadmapTitle || aiResponse.targetRole || 'Personalized Career Path',
                            milestones: aiResponse.milestones || []
                        }
                    ],
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Career roadmap generated', roadmap: updatedRoadmap });
    } catch (error) {
        console.error('Roadmap generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
