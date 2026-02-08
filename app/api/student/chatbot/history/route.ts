import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import AIChatSession from '@/models/AIChatSession';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');
        const listSessions = searchParams.get('listSessions') === 'true';

        // Connect to database
        await dbConnect();

        if (listSessions) {
            // Fetch all sessions for the user, grouped by date
            const sessions = await AIChatSession.find({ userId })
                .sort({ lastMessageAt: -1 })
                .lean();

            return NextResponse.json({
                success: true,
                sessions: sessions.map((s) => ({
                    id: s._id,
                    title: s.title,
                    lastMessageAt: s.lastMessageAt,
                    createdAt: s.createdAt,
                })),
            });
        }

        if (sessionId) {
            // Fetch messages for a specific session
            const messages = await ChatMessage.find({ userId, sessionId })
                .sort({ createdAt: 1 })
                .lean();

            return NextResponse.json({
                success: true,
                messages: messages.map((msg) => ({
                    id: msg._id,
                    role: msg.role,
                    content: msg.content,
                    sources: msg.metadata?.sources || [],
                    createdAt: msg.createdAt,
                })),
            });
        }

        // Default: If no sessionId or listSessions, return latest session messages or empty
        const latestSession = await AIChatSession.findOne({ userId })
            .sort({ lastMessageAt: -1 });

        if (!latestSession) {
            return NextResponse.json({ success: true, messages: [], sessionId: null });
        }

        const messages = await ChatMessage.find({ userId, sessionId: latestSession._id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            sessionId: latestSession._id,
            messages: messages.map((msg) => ({
                id: msg._id,
                role: msg.role,
                content: msg.content,
                sources: msg.metadata?.sources || [],
                createdAt: msg.createdAt,
            })),
        });
    } catch (error: any) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat history', details: error.message },
            { status: 500 }
        );
    }
}
