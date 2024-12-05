// frontend/src/services/socket.js
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  autoConnect: true,
  reconnection: true
});

socket.on('connect', () => {
  console.log('Socket connected');
  try {
    const userId = localStorage.getItem('userId');
    const storedCounts = localStorage.getItem('unreadCounts');
    
    if (userId) {
      socket.emit('userConnected', userId);
      
      // Safely parse and emit unread counts
      if (storedCounts) {
        try {
          const unreadCounts = JSON.parse(storedCounts);
          if (unreadCounts && typeof unreadCounts === 'object') {
            socket.emit('syncUnreadCounts', unreadCounts);
          }
        } catch (error) {
          console.error('Error parsing unread counts:', error);
          localStorage.removeItem('unreadCounts'); // Clear invalid data
        }
      }
    }
  } catch (error) {
    console.error('Error in socket connection:', error);
  }
});

export default socket;