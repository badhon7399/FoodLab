import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};