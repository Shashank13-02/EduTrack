import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('chatId');

        if (!chatId) {
            return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
        }

        await connectDB();

        const messages = await Message.find({ chatId })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ messages }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatId, content, isAIGenerated, performanceContext } = await req.json();

        if (!chatId || !content) {
            return NextResponse.json({ error: 'Chat ID and content required' }, { status: 400 });
        }

        await connectDB();

        const senderId = authResult.user.userId;

        // Create message
        const message = await Message.create({
            chatId,
            senderId,
            content,
            isAIGenerated: isAIGenerated || false,
            performanceContext: performanceContext || undefined,
            read: false,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'name role')
            .lean();

        // Update chat's last message and unread count
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.lastMessage = {
                content,
                senderId: new mongoose.Types.ObjectId(senderId),
                timestamp: new Date(),
            };

            // Increment unread count for the recipient
            const senderRole = authResult.user.role;
            if (senderRole === 'TEACHER') {
                chat.unreadCount!.student += 1;
            } else if (senderRole === 'STUDENT') {
                chat.unreadCount!.teacher += 1;
            }

            await chat.save();
        }

        // Emit socket event if global.io is available
        if ((global as any).io) {
            (global as any).io.to(`chat:${chatId}`).emit('new-message', populatedMessage);
        }

        return NextResponse.json({ message: populatedMessage }, { status: 201 });
    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: error.message },
            { status: 500 }
        );
    }
}
