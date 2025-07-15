const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.user.username} connected`);

    // Join user to their own room for notifications
    socket.join(socket.userId);

    // Handle joining specific rooms (like conversations)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`📱 User ${socket.user.username} joined room ${roomId}`);
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`📱 User ${socket.user.username} left room ${roomId}`);
    });

    // Handle real-time message sending
    socket.on('send_message', (data) => {
      // This is handled by the HTTP API, but we can add additional real-time logic here
      console.log(`💬 Message from ${socket.user.username}:`, data);
    });

    // Handle message read status
    socket.on('mark_message_read', (messageId) => {
      // Emit to other participants that message was read
      socket.broadcast.emit('message_read', {
        messageId,
        readBy: socket.userId
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.conversationId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle user online status
    socket.on('user_online', () => {
      socket.broadcast.emit('user_online', socket.userId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.user.username} disconnected`);
      socket.broadcast.emit('user_offline', socket.userId);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = socketHandler;