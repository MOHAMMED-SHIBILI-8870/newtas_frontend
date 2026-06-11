import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../infrastructure/api/chatApi';
import { createChatSocket } from '../infrastructure/sockets/chatSocket';

export const useChat = (currentUserId, targetReceiverId) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const socketRef = useRef(null);

  // Sync historical message arrays
  useEffect(() => {
    if (!currentUserId || !targetReceiverId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const payload = await chatApi.fetchHistory(currentUserId, targetReceiverId);
        setMessages(payload.messages || []);
        setIsPartnerOnline(payload.is_online || false);
      } catch (err) {
        console.error('Could not initialize message sync history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [currentUserId, targetReceiverId]);

  // Handle persistent real-time streaming connections
  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = createChatSocket({
      userId: currentUserId,
      onStatusChange: (status) => setConnectionStatus(status),
      onMessage: (newMessage) => {
        // Only append incoming items if they belong to this specific ongoing active conversation thread
        const isCurrentConversation =
          (newMessage.sender_id == currentUserId && newMessage.receiver_id == targetReceiverId) ||
          (newMessage.sender_id == targetReceiverId && newMessage.receiver_id == currentUserId);

        if (isCurrentConversation) {
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [currentUserId, targetReceiverId]);

  const sendMessage = (content) => {
    if (!content.trim() || !socketRef.current) return;
    socketRef.current.send(targetReceiverId, content);
  };

  return {
    messages,
    connectionStatus,
    loadingHistory,
    isPartnerOnline,
    sendMessage,
  };
};