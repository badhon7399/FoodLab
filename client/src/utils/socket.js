import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
    // Feature flag: enable only when backend supports Socket.IO
    if (import.meta.env.VITE_ENABLE_SOCKET !== 'true') return null;

    if (socket) return socket;

    try {
        const api = import.meta.env.VITE_API_URL || '';
        const baseUrl = api.endsWith('/api') ? api.slice(0, -4) : api.replace('/api', '');

        socket = io(baseUrl, {
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

        socket.on('connect_error', (err) => {
            console.warn('Socket connect error:', err?.message || err);
        });

        return socket;
    } catch (e) {
        console.warn('Socket init failed:', e?.message || e);
        return null;
    }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};