const socketIo = require('socket.io');

let io;
const userSocketMap = new Map(); // userId -> socketId

exports.init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173", // Vite default port
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('register', (userId) => {
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

exports.sendNotification = (userId, notification) => {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId} via socket ${socketId}`);
    } else {
        console.log(`User ${userId} is not connected, notification stored in DB (already done)`);
    }
};

exports.getIo = () => io;
