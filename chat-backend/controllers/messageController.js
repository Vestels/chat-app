// controllers/messageController.js
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  const { roomId, content } = req.body;

  if (!roomId || !content) {
    return res.status(400).json({ error: 'RoomId and content are required' });
  }

  try {
    const message = new Message({
      room: roomId,
      sender: req.user.userId,
      content
    });
    await message.save();
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};