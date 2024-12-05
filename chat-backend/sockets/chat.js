// backend/sockets/chat.js
const onlineUsers = new Map(); // socketId -> userId
const rooms = new Map(); // roomId -> [userId1, userId2]
const userRooms = new Map(); // userId -> Set(roomIds)
const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('userConnected', async (userId) => {
      if (userId) {
        onlineUsers.set(socket.id, userId);
        
        const rooms = await Room.find({
          'members.user': userId,
          'members.unreadCount': { $gt: 0 }
        });
    
        const notifications = {};
        rooms.forEach(room => {
          const member = room.members.find(m => m.user.toString() === userId);
          if (member && member.unreadCount > 0) {
            notifications[room._id] = member.unreadCount;
          }
        });
    
        if (Object.keys(notifications).length > 0) {
          socket.emit('offlineNotifications', notifications);
        }
        const users = await User.find({}, 'username email');
        io.emit('userListUpdate', users);
        io.emit('onlineUsers', Array.from(onlineUsers.values()));
      }
    });

    socket.on('createPrivateRoom', async ({ userId1, userId2, roomId }) => {
      try {
        let room = await Room.findOne({ roomId });
        if (!room) {
          room = new Room({
            roomId,
            members: [
              { user: userId1 },
              { user: userId2 }
            ]
          });
          await room.save();
        }
        socket.join(roomId);
      } catch (err) {
        console.error('Error creating room:', err);
      }
    });

    socket.on('sendPrivateMessage', async (messageData) => {
      try {
        const message = new Message(messageData);
        await message.save();
    
        // Find room by roomId field, not _id
        const room = await Room.findOne({ roomId: messageData.roomId });
        if (room) {
          room.lastMessage = {
            content: messageData.content,
            sender: messageData.senderId,
            timestamp: messageData.timestamp
          };
          await room.updateUnreadCount(messageData.senderId, messageData.timestamp);
        }
    
        io.emit('newMessage', message);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('getChatHistory', async ({ roomId }) => {
      try {
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        socket.emit('chatHistory', { roomId, messages });
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    });

    socket.on('disconnect', () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        console.log('User disconnected: ' + socket.id);
        onlineUsers.delete(socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.values()));
      }
    });
  });
};