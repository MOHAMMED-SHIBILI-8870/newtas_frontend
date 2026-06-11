import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';

export const ChatWindow = ({ currentUserId, targetReceiverId, token }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messageEndRef = useRef(null);
  
  const { messages, connectionStatus, loadingHistory, sendMessage } = useChat(
    currentUserId,
    targetReceiverId,
    token
  );

  // Auto-scroll anchor lock adjustments
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div class="flex flex-col h-[500px] w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header Bar Area */}
      <div class="flex items-center justify-between bg-slate-800 text-white p-4">
        <div>
          <h3 class="font-medium text-sm">Chat with ID: {targetReceiverId}</h3>
          <span class="text-xs text-slate-400">Acting as User: {currentUserId}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class={`h-2.5 w-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span class="text-xs capitalize text-slate-300">{connectionStatus}</span>
        </div>
      </div>

      {/* Message Streaming Body viewport */}
      <div class="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
        {loadingHistory ? (
          <div class="text-center text-xs text-gray-400 py-4">Syncing secure logs...</div>
        ) : messages.length === 0 ? (
          <div class="text-center text-xs text-gray-400 py-4">No previous transmissions logged.</div>
        ) : (
          messages.map((msg, index) => {
            const isMe = String(msg.sender_id) === String(currentUserId);
            return (
              <div key={msg.id || index} class={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div class={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  <p class="break-words">{msg.content}</p>
                  <span class={`block text-[10px] text-right mt-1 opacity-60`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Control Submission Tray */}
      <form onSubmit={handleSend} class="border-t border-gray-200 p-3 bg-white flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={connectionStatus === 'connected' ? "Type a message..." : "Reconnecting to stream..."}
          disabled={connectionStatus !== 'connected'}
          class="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={connectionStatus !== 'connected'}
          class="bg-blue-600 text-white font-medium text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};