import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import AIChatSession from '@/models/AIChatSession';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
    try {
        // Verify authentication
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const userId = decoded.userId;

        // Connect to database
        await dbConnect();

        // Delete all messages for this user
        await ChatMessage.deleteMany({ userId });

        // Delete all sessions for this user
        await AIChatSession.deleteMany({ userId });

        return NextResponse.json({
            success: true,
            message: 'Chat history cleared successfully',
        });
    } catch (error: any) {
        console.error('Error clearing chat history:', error);
        return NextResponse.json(
            { error: 'Failed to clear chat history', details: error.message },
            { status: 500 }
        );
    }
}
