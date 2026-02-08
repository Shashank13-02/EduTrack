import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import AIChatSession from '@/models/AIChatSession';
import { verifyToken } from '@/lib/auth';
import { processChatbotQuery } from '@/lib/chatbotService';

export async function POST(req: NextRequest) {
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

        // Parse request body
        const { message, sessionId } = await req.json();
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Connect to database
        await dbConnect();

        let currentSessionId = sessionId;
        let isNewSession = false;

        // Create session if it doesn't exist
        if (!currentSessionId) {
            const sessionTitle = message.trim().substring(0, 40) + (message.trim().length > 40 ? '...' : '');
            const session = await AIChatSession.create({
                userId,
                title: sessionTitle,
                lastMessageAt: new Date(),
            });
            currentSessionId = session._id;
            isNewSession = true;
        } else {
            // Update lastMessageAt for existing session
            await AIChatSession.findByIdAndUpdate(currentSessionId, {
                lastMessageAt: new Date(),
            });
        }

        // Get recent chat history (last 10 messages for context) within this session
        const recentMessages = await ChatMessage.find({ userId, sessionId: currentSessionId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Reverse to get chronological order
        const chatHistory = recentMessages
            .reverse()
            .map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            }));

        // Save user message
        const userMessage = await ChatMessage.create({
            userId,
            sessionId: currentSessionId,
            role: 'user',
            content: message.trim(),
        });

        // Process query with RAG
        let assistantResponse: string;
        let sources: any[] = [];

        try {
            const result = await processChatbotQuery(message, chatHistory);
            assistantResponse = result.answer;
            sources = result.sources || [];
        } catch (error: any) {
            console.error('Error processing chatbot query:', error);

            // Fallback response if RAG fails
            assistantResponse =
                "I apologize, but I'm having trouble accessing the knowledge base right now. " +
                "Please try again in a moment, or contact the administration office for immediate assistance.";
        }

        // Save assistant response
        const assistantMessage = await ChatMessage.create({
            userId,
            sessionId: currentSessionId,
            role: 'assistant',
            content: assistantResponse,
            metadata: {
                sources: sources.map((s) => s.metadata?.title || 'Unknown'),
            },
        });

        return NextResponse.json({
            success: true,
            sessionId: currentSessionId,
            isNewSession,
            message: {
                id: assistantMessage._id,
                role: 'assistant',
                content: assistantResponse,
                sources: sources.map((s) => ({
                    title: s.metadata?.title,
                    category: s.metadata?.category,
                })),
                createdAt: assistantMessage.createdAt,
            },
        });
    } catch (error: any) {
        console.error('Error in chatbot message endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to process message', details: error.message },
            { status: 500 }
        );
    }
}
