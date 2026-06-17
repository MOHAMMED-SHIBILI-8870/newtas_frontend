import React, { useState } from 'react';
import { usePermission } from '../../../hooks/usePermission';
import { useChat } from '../../../hooks/useChat';
import { ShieldAlert, MessageCircle, Send, Star, AlertTriangle, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { chatApi } from '../../../infrastructure/api/chatApi';

const SupportChatArea = ({ currentAdminId, targetUserId, targetUserName }) => {
  const { messages, connectionStatus, loadingHistory, isPartnerOnline, sendMessage } = useChat(
    currentAdminId,
    targetUserId
  );
  const [text, setText] = useState('');
  const messagesEndRef = React.useRef(null);
  const { pathname } = useLocation();
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver');

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
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px] rounded-2xl border ${
        isDark ? 'bg-zinc-950/60 border-white/10 text-white/50 shadow-xl' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <ShieldAlert className={`h-16 w-16 mb-4 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white/80' : 'text-slate-600'}`}>No active chat</h3>
        <p className={`text-sm ${isDark ? 'text-white/45' : 'text-slate-500'}`}>Select a conversation from the active chats list</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col rounded-2xl border shadow-xl overflow-hidden h-[600px] ${
      isDark ? 'bg-zinc-950/60 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${
        isDark ? 'border-white/5 bg-zinc-900/40' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
            isDark ? 'bg-zinc-800 text-white' : 'bg-slate-900 text-white'
          }`}>
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {targetUserName || `User ID: ${targetUserId}`}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : isDark ? 'bg-white/20' : 'bg-slate-300'}`}></span>
              <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-550'}`}>{isPartnerOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${
          isDark ? 'text-yellow-350 bg-yellow-400/10 border-yellow-400/20' : 'text-slate-500 bg-white border-slate-200 shadow-sm'
        }`}>
          {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
        isDark ? 'bg-zinc-950/30' : 'bg-slate-50/30'
      }`}>
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-yellow-450' : 'border-slate-900'}`}></div>
          </div>
        ) : messages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
            <p>No messages with this user yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSupport = String(msg.sender_id) === String(currentAdminId) || msg.sender_id === 'support';
            return (
              <div key={i} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  isSupport
                    ? isDark ? 'bg-yellow-400 text-slate-950 font-bold rounded-br-sm' : 'bg-slate-900 text-white rounded-br-sm'
                    : isDark ? 'bg-zinc-900 border border-white/10 text-white rounded-bl-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t ${isDark ? 'bg-zinc-950/60 border-white/5' : 'bg-white border-slate-100'}`}>
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your response..."
            className={`flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
              isDark
                ? 'bg-black border border-white/10 text-white placeholder-white/30 focus:border-yellow-400/80 focus:ring-1 focus:ring-yellow-400/20'
                : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900'
            }`}
            disabled={connectionStatus !== 'connected'}
          />
          <button
            type="submit"
            disabled={!text.trim() || connectionStatus !== 'connected'}
            className={`flex items-center justify-center rounded-xl px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
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
  const { pathname } = useLocation();
  const isDark = pathname.startsWith('/admin') || pathname.startsWith('/driver');

  const [activeContact, setActiveContact] = useState(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Support Hub</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Manage user chats, reviews, and complaints from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={isDark ? "/admin/reviews" : "/reviews"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
              isDark
                ? 'bg-zinc-900 border border-white/10 text-white hover:bg-white/5'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Star className="h-4 w-4 text-amber-500" />
            Reviews
          </Link>
          <Link
            to={isDark ? "/admin/complaints" : "/complaints"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
              isDark
                ? 'bg-zinc-900 border border-white/10 text-white hover:bg-white/5'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Complaints
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[600px]">
          <div className={`p-4 rounded-2xl border flex-1 flex flex-col overflow-hidden shadow-xl ${
            isDark ? 'bg-zinc-950/60 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 px-2 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              <MessageCircle className="h-5 w-5 text-slate-500" />
              Active Chats
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {loadingContacts ? (
                <div className="flex justify-center p-4">
                  <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDark ? 'border-yellow-400' : 'border-slate-900'}`}></div>
                </div>
              ) : contacts.length === 0 ? (
                <div className={`text-center p-6 text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  No one has contacted support yet.
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activeContact?.id === contact.id 
                        ? isDark ? 'bg-yellow-400 text-slate-950 font-bold shadow-sm' : 'bg-slate-900 text-white shadow-sm' 
                        : isDark ? 'hover:bg-white/5 border border-white/5 text-white/90' : 'hover:bg-slate-50 border border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                      activeContact?.id === contact.id
                        ? isDark ? 'bg-yellow-500 text-slate-950' : 'bg-slate-850 text-white'
                        : isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <h4 className="text-sm font-semibold truncate">{contact.name}</h4>
                      <p className="text-xs opacity-60">ID: {contact.id}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <SupportChatArea 
            currentAdminId={currentAdminId} 
            targetUserId={activeContact?.id} 
            targetUserName={activeContact?.name} 
          />
        </div>
      </div>
    </div>
  );
}
