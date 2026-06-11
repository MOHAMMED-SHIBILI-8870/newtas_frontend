import { getStoredToken } from '../auth/session';

// Derives proper ws:// port configuration based on your environment definitions
const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8997';
const WS_BASE_URL = VITE_API_URL.replace(/^http/, 'ws') + '/api/v1/chat';

export const createChatSocket = ({ userId, onMessage, onStatusChange }) => {
  const token = getStoredToken();
  
  if (!token) {
    console.error('Cannot initialize socket: No active session token found.');
    onStatusChange('unauthorized');
    return null;
  }

  // Appends token inline to bypass browser WebSocket header constraints
  const wsUrl = `${WS_BASE_URL}/ws?user_id=${userId}&token=${token}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    onStatusChange('connected');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.error) return;
      onMessage(data);
    } catch (err) {
      console.error('Failed to read incoming socket frame:', err);
    }
  };

  socket.onclose = () => {
    onStatusChange('disconnected');
  };

  socket.onerror = () => {
    onStatusChange('error');
  };

  return {
    send: (receiverId, content) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ receiver_id: receiverId, content }));
      }
    },
    close: () => {
      socket.close();
    }
  };
};