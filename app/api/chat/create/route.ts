import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { teacherId, studentId } = await req.json();

        if (!teacherId || !studentId) {
            return NextResponse.json(
                { error: 'Teacher ID and Student ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify both users exist
        const teacher = await User.findById(teacherId);
        const student = await User.findById(studentId);

        if (!teacher || teacher.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
        }

        if (!student || student.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            'participants.teacherId': teacherId,
            'participants.studentId': studentId,
        });

        if (!chat) {
            // Create new chat
            chat = await Chat.create({
                participants: {
                    teacherId,
                    studentId,
                },
                unreadCount: {
                    teacher: 0,
                    student: 0,
                },
            });
        }

        const populatedChat = await Chat.findById(chat._id)
            .populate('participants.teacherId', 'name email department')
            .populate('participants.studentId', 'name email department year')
            .lean();

        return NextResponse.json({ chat: populatedChat }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating/finding chat:', error);
        return NextResponse.json(
            { error: 'Failed to create chat', details: error.message },
            { status: 500 }
        );
    }
}
