// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }
}, {
  timestamps: true
});

RoomSchema.methods.updateUnreadCount = async function(senderId, messageTimestamp) {
  for (const member of this.members) {
    if (member.user.toString() !== senderId) {
      member.unreadCount++;
    } else {
      member.lastRead = messageTimestamp;
    }
  }
  await this.save();
};

RoomSchema.methods.resetUnreadCount = async function(userId) {
  const member = this.members.find(m => m.user.toString() === userId);
  if (member) {
    member.unreadCount = 0;
    member.lastRead = new Date();
    await this.save();
  }
};

module.exports = mongoose.model('Room', RoomSchema);