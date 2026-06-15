import React, { useState } from 'react';
import { usePermission } from '../../../hooks/usePermission';
import { useChat } from '../../../hooks/useChat';
import { ShieldAlert, MessageCircle, Send, Star, AlertTriangle, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../../infrastructure/api/chatApi';

const SupportChatArea = ({ currentAdminId, targetUserId }) => {
  const { messages, connectionStatus, loadingHistory, isPartnerOnline, sendMessage } = useChat(
    currentAdminId,
    targetUserId
  );
  const [text, setText] = useState('');
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (!targetUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
        <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">No active chat</h3>
        <p className="text-sm text-slate-500">Enter a User ID to pull up their chat history</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-white">
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">User ID: {targetUserId}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className="text-xs font-medium text-slate-500">{isPartnerOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
            <p>No messages with this user yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSupport = String(msg.sender_id) === String(currentAdminId) || msg.sender_id === 'support';
            return (
              <div key={i} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isSupport ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            type="submit"
            disabled={!text.trim() || connectionStatus !== 'connected'}
            className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function SupportHub() {
  const { user } = usePermission();
  const currentAdminId = String(user?.id || '4'); // Use actual Support ID

  const [activeUserId, setActiveUserId] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  React.useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactIds = await chatApi.fetchContacts();
        setContacts(contactIds);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };
    loadContacts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user chats, reviews, and complaints from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/reviews" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <Star className="h-4 w-4 text-amber-500" />
            Reviews
          </Link>
          <Link to="/complaints" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Complaints
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[600px]">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 px-2">
              <MessageCircle className="h-5 w-5 text-slate-500" />
              Active Chats
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {loadingContacts ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  No one has contacted support yet.
                </div>
              ) : (
                contacts.map((contactId) => (
                  <button
                    key={contactId}
                    onClick={() => setActiveUserId(contactId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activeUserId === contactId 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'hover:bg-slate-50 border border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                      activeUserId === contactId ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <h4 className="text-sm font-semibold truncate">User ID: {contactId}</h4>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <SupportChatArea currentAdminId={currentAdminId} targetUserId={activeUserId} />
        </div>
      </div>
    </div>
  );
}
