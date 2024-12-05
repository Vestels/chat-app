// src/components/Chat/PrivateChat.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Avatar 
} from '@mui/material';
import socket from '../../services/socket';

const PrivateChat = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const roomId = [currentUserId, selectedUser._id].sort().join('-');
    
    socket.emit('createPrivateRoom', {
      userId1: currentUserId,
      userId2: selectedUser._id
    });

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socket.off('newMessage');
  }, [selectedUser, currentUserId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const roomId = [currentUserId, selectedUser._id].sort().join('-');
    
    socket.emit('sendPrivateMessage', {
      roomId,
      senderId: currentUserId,
      content: newMessage
    });
    
    setNewMessage('');
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Avatar sx={{ display: 'inline-block', mr: 2 }}>
          {selectedUser.username[0].toUpperCase()}
        </Avatar>
        <Typography variant="h6" display="inline">
          {selectedUser.username}
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === currentUserId ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Paper
              sx={{
                p: 1,
                bgcolor: msg.sender === currentUserId ? 'primary.light' : 'grey.100',
                maxWidth: '70%'
              }}
            >
              <Typography>{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default PrivateChat;