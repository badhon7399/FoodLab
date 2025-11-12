import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Join admin room if user is admin
        if (socket.userRole === 'admin') {
            socket.join('admin-room');
            console.log(`👑 Admin joined admin-room`);
        }

        // Join user's personal room
        socket.join(`user-${socket.userId}`);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });

        // Custom events
        socket.on('join-order-room', (orderId) => {
            socket.join(`order-${orderId}`);
            console.log(`📦 User joined order room: ${orderId}`);
        });

        socket.on('leave-order-room', (orderId) => {
            socket.leave(`order-${orderId}`);
            console.log(`📦 User left order room: ${orderId}`);
        });
    });

    return io;
};

// Export helper functions to emit events
export const emitNewOrder = (io, order) => {
    io.to('admin-room').emit('new-order', {
        orderId: order._id,
        customer: order.user.name,
        totalAmount: order.totalAmount,
        items: order.items.length,
        timestamp: new Date(),
    });
};

export const emitOrderStatusUpdate = (io, orderId, status, userId) => {
    io.to(`user-${userId}`).emit('order-status-updated', {
        orderId,
        status,
        timestamp: new Date(),
    });

    io.to(`order-${orderId}`).emit('order-status-updated', {
        orderId,
        status,
        timestamp: new Date(),
    });
};

export const emitPaymentUpdate = (io, userId, paymentData) => {
    io.to(`user-${userId}`).emit('payment-update', {
        ...paymentData,
        timestamp: new Date(),
    });
};

export const emitNotification = (io, userId, notification) => {
    io.to(`user-${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date(),
    });
};