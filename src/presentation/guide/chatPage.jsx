import React from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../../hooks/useChat';
import { useAuth } from '../../auth/hooks/useAuth';

export const GuideChatPage = () => {
  // 1. Get the Customer/User ID from the URL parameters (e.g., /guide/chat/:userId)
  const { userId } = useParams(); 
  
  // 2. Get the logged-in Guide's own ID from the context profile
  const { user } = useAuth(); 
  const currentGuideId = user?.id || user?.sub; 

  // 3. Pass them to the same useChat hook. 
  // Remember: First argument is always YOUR OWN id, second argument is the RECEIVER id.
  const { messages, connectionStatus, loadingHistory, sendMessage } = useChat(
    currentGuideId, 
    userId
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
      <div className="bg-slate-900 text-white rounded-lg shadow border border-slate-800 p-4">
        <div className="flex justify-between border-b border-slate-800 pb-2 mb-4">
          <h2 className="font-bold text-lg text-emerald-400">Guide Portal: Chat with Client #{userId}</h2>
          <span className={`text-sm ${connectionStatus === 'connected' ? 'text-emerald-500' : 'text-rose-500'}`}>
            ● {connectionStatus}
          </span>
        </div>

        {/* Message Panel Area */}
        <div className="h-96 overflow-y-auto bg-slate-950 p-4 rounded mb-4 space-y-2">
          {loadingHistory ? (
            <p className="text-center text-slate-500">Retrieving secure historical threads...</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${String(msg.sender_id) === String(currentGuideId) ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded max-w-xs ${String(msg.sender_id) === String(currentGuideId) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
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
            className="flex-1 bg-slate-800 border border-slate-700 p-2 rounded text-white focus:outline-none focus:border-emerald-500" 
            placeholder="Reply to client..."
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-medium">Reply</button>
        </form>
      </div>
    </div>
  );
};