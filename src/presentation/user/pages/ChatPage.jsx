import React from 'react';
import { useParams } from 'react-router-dom'; 
import { useChat } from '../../../hooks/useChat';
// Assuming you store your logged-in profile in a hook or state context
import { useAuth } from '../../auth/hooks/useAuth'; 

export const UserChatPage = () => {
  // 1. Get the Guide ID from the URL route parameters (e.g., /user/chat/:guideId)
  const { guideId } = useParams(); 
  
  // 2. Get the logged-in User's information from your Auth state
  const { user } = useAuth(); 
  const currentUserId = user?.id || user?.sub; 

  // 3. Pass them into your reactive business-logic hook
  const { messages, connectionStatus, loadingHistory, isPartnerOnline, sendMessage } = useChat(
    currentUserId, 
    guideId
  );

  const [text, setText] = React.useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex justify-between border-b pb-2 mb-4">
          <h2 className="font-bold text-lg text-gray-800">Chatting with Guide #{guideId}</h2>
          <div className="flex flex-col items-end">
            <span className={`text-xs ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-500'}`}>
              Server: {connectionStatus}
            </span>
            <span className={`text-sm font-semibold ${isPartnerOnline ? 'text-green-600' : 'text-gray-500'}`}>
              ● {isPartnerOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Message Panel Area */}
        <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded mb-4 space-y-2">
          {loadingHistory ? (
            <p className="text-center text-gray-400">Loading chat history...</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${String(msg.sender_id) === String(currentUserId) ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded max-w-xs ${String(msg.sender_id) === String(currentUserId) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input tray */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={text} 
            onChange={e => setText(e.target.value)}
            className="flex-1 border p-2 rounded" 
            placeholder="Ask your guide a question..."
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </form>
      </div>
    </div>
  );
};