// src/components/Chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, TextField, Button, Typography, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import UserList from './UserList';
import socket from '../../services/socket';
import { format } from 'date-fns';

const ChatRoom = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const currentUserId = localStorage.getItem('userId');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentUserId) {
      socket.connect();
      socket.emit('userConnected', currentUserId);
    }

    socket.on('offlineNotifications', (notifications) => {
      setUnreadMessages(prev => ({
        ...prev,
        ...notifications
      }));
    });

    return () => {
      socket.off('offlineNotifications');
    };
  }, [currentUserId]);

  useEffect(() => {
    socket.on('newMessage', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.roomId]: [...(prev[message.roomId] || []), message]
      }));

      if (message.roomId !== roomId && message.senderId !== currentUserId) {
        setUnreadMessages(prev => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1
        }));
      }

      // Always scroll to bottom for new messages in active room
      if (message.roomId === roomId) {
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => socket.off('newMessage');
  }, [roomId, currentUserId]);

  // Handle chat history
  useEffect(() => {
    if (roomId) {
      const handleChatHistory = (data) => {
        setMessages(prev => ({
          ...prev,
          [roomId]: data.messages
        }));
        // Scroll to bottom after loading history
        setTimeout(scrollToBottom, 100);
      };

      socket.on('chatHistory', handleChatHistory);
      socket.emit('getChatHistory', { roomId });

      return () => socket.off('chatHistory');
    }
  }, [roomId]);

  const handleUserSelect = (user) => {
    if (selectedUser?._id === user._id) return;
    
    const newRoomId = [currentUserId, user._id].sort().join('-');
    setSelectedUser(user);
    setRoomId(newRoomId);
    
    socket.emit('createPrivateRoom', {
      userId1: currentUserId,
      userId2: user._id,
      roomId: newRoomId
    });

    setUnreadMessages(prev => ({ ...prev, [newRoomId]: 0 }));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !roomId) return;
    
    const messageData = {
      roomId,
      senderId: currentUserId,
      content: newMessage,
      timestamp: new Date()
    };

    socket.emit('sendPrivateMessage', messageData);
    setNewMessage('');
  };

  const currentMessages = messages[roomId] || [];

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '90vh' }}>
        <Grid item xs={12} md={4}>
        <UserList 
  onUserSelect={handleUserSelect} 
  activeRoomId={roomId}
  unreadMessages={unreadMessages}
  messages={messages}
/>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            height: '90vh',
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            {selectedUser ? (
              <>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="h6">{selectedUser.username}</Typography>
                </Box>
                
                <Box
                  ref={messagesContainerRef}
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    p: 2,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'background.paper',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'primary.main',
                      borderRadius: '4px',
                    },
                  }}
                >
                  {currentMessages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: message.senderId === currentUserId ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.senderId === currentUserId ? 'primary.dark' : 'background.paper',
                          borderRadius: 2
                        }}
                      >
                        <Typography>{message.content}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                <Box sx={{ 
                  p: 2, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      endIcon={<SendIcon />}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Select a user to start chatting
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatRoom;