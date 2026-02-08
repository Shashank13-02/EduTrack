'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocketNotifications(userId: string | null) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Initialize socket connection only once
        if (!socket) {
            socket = io({
                path: '/socket.io/',
                addTrailingSlash: false,
            });

            socket.on('connect', () => {
                console.log('✅ Socket.IO connected');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket.IO disconnected');
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connect error:', error);
            });
        }

        // Join user-specific room
        socket.emit('join', userId);
        console.log(`🔔 Joined notification room for user: ${userId}`);

        return () => {
            // Don't disconnect socket on unmount, just leave the room
            // Socket will persist across page navigation
        };
    }, [userId]);

    return { socket, isConnected };
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
