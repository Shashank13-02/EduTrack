const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    // Seed data on startup for in-memory DB
    try {
        const { seedData } = require('./lib/seed-data');
        await seedData();
        console.log('✅ In-memory data seeded');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.NEXT_PUBLIC_APP_URL
                : 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join user-specific room based on userId
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Join specific chat room
        socket.on('join-chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`Socket ${socket.id} joined chat:${chatId}`);
        });

        // Leave chat room
        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`Socket ${socket.id} left chat:${chatId}`);
        });

        // Handle new message
        socket.on('send-message', (data) => {
            const { chatId, message } = data;
            // Emit to all users in the chat room
            io.to(`chat:${chatId}`).emit('new-message', message);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { chatId, userId, isTyping } = data;
            socket.to(`chat:${chatId}`).emit('user-typing', { userId, isTyping });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Make io accessible to API routes
    global.io = io;

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.IO server running`);
        });
});
