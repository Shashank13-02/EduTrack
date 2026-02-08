import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const userId = authResult.user.userId;
        const userRole = authResult.user.role;

        let query;
        if (userRole === 'TEACHER') {
            query = { 'participants.teacherId': userId };
        } else if (userRole === 'STUDENT') {
            query = { 'participants.studentId': userId };
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
        }

        const chats = await Chat.find(query)
            .populate('participants.teacherId', 'name email department')
            .populate('participants.studentId', 'name email department year')
            .sort({ 'lastMessage.timestamp': -1 })
            .lean();

        return NextResponse.json({ chats }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching chats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chats', details: error.message },
            { status: 500 }
        );
    }
}
