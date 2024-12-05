// src/components/Chat/UserList.jsx
import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Badge,
} from '@mui/material';
import api from '../../services/api';
import socket from '../../services/socket';

const UserList = ({ onUserSelect, activeRoomId, unreadMessages, messages }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  
    socket.on('userListUpdate', (updatedUsers) => {
      setUsers(updatedUsers);
    });
  
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users || []);
    });
  
    return () => {
      socket.off('userListUpdate');
      socket.off('onlineUsers');
    };
  }, []);

  const isOnline = (userId) => onlineUsers.includes(userId);

  const getRoomId = (userId1, userId2) => [userId1, userId2].sort().join('-');

  const getLastMessageTimestamp = (userId) => {
    const roomId = getRoomId(currentUserId, userId);
    const roomMessages = messages[roomId] || [];
    return roomMessages.length > 0 
      ? new Date(roomMessages[roomMessages.length - 1].timestamp).getTime()
      : 0;
  };

  const getUnreadCount = (userId) => {
    const roomId = getRoomId(currentUserId, userId);
    return unreadMessages[roomId] || 0;
  };

  const sortUsers = (users) => {
    return [...users]
      .filter(user => user._id !== currentUserId)
      .sort((a, b) => {
        const aRoomId = getRoomId(currentUserId, a._id);
        const bRoomId = getRoomId(currentUserId, b._id);
        
        if (aRoomId === activeRoomId) return -1;
        if (bRoomId === activeRoomId) return 1;

        const aTimestamp = getLastMessageTimestamp(a._id);
        const bTimestamp = getLastMessageTimestamp(b._id);
        if (aTimestamp !== bTimestamp) return bTimestamp - aTimestamp;
        
        const aOnline = isOnline(a._id);
        const bOnline = isOnline(b._id);
        if (aOnline !== bOnline) return bOnline ? 1 : -1;

        return 0;
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  const sortedUsers = sortUsers(users);

  return (
    <Paper sx={{ 
      width: '100%', 
      height: '90vh',
      bgcolor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Users ({sortedUsers.length})
      </Typography>
      <List sx={{ 
        overflowY: 'auto',
        height: 'calc(100% - 64px)',
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
      }}>
        {sortedUsers.map((user) => {
          const isActive = getRoomId(currentUserId, user._id) === activeRoomId;
          
          return (
            <ListItem 
              key={user._id} 
              disablePadding
              sx={{
                bgcolor: isActive ? 'action.selected' : 'transparent',
                borderLeft: isActive ? 3 : 0,
                borderColor: 'primary.main'
              }}
            >
              <ListItemButton 
                onClick={() => onUserSelect(user)}
                sx={{
                  '&:hover': {
                    bgcolor: isActive ? 'action.selected' : 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={getUnreadCount(user._id)}
                    color="error"
                    invisible={isActive}
                    sx={{
                      '& .MuiBadge-badge': {
                        right: 5,
                        top: 5,
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: isOnline(user._id) ? 'success.main' : 'grey.500' }}>
                      {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.username}
                  secondary={isOnline(user._id) ? 'Online' : 'Offline'}
                  secondaryTypographyProps={{
                    sx: { color: isOnline(user._id) ? 'success.main' : 'text.secondary' }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

UserList.defaultProps = {
  messages: {}
};

export default UserList;