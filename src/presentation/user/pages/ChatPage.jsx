import React, { useState, useEffect } from 'react';
import { usePermission } from '../../../hooks/usePermission';
import { useChat } from '../../../hooks/useChat';
import { Search, Plus, UserCircle, ShieldAlert, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../../infrastructure/api/chatApi';

const ChatArea = ({ currentUserId, partnerId, partnerName }) => {
  const { messages, connectionStatus, loadingHistory, isPartnerOnline, sendMessage } = useChat(
    currentUserId,
    partnerId
  );
  const [text, setText] = useState('');
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (!partnerId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
        <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">Select a conversation</h3>
        <p className="text-sm text-slate-500">Choose a contact from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-cyan-100 text-cyan-600">
            {partnerId === 'support' ? <ShieldAlert className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">{partnerName}</h2>
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = String(msg.sender_id) === String(currentUserId);
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            type="submit"
            disabled={!text.trim() || connectionStatus !== 'connected'}
            className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = usePermission();
  const currentUserId = user?.id || user?.sub;

  const [contacts, setContacts] = useState([{ id: 'support', name: 'Customer Support', type: 'support' }]);

  const [selectedPartnerId, setSelectedPartnerId] = useState('support');
  const [newGuideId, setNewGuideId] = useState('');
  const [realSupportId, setRealSupportId] = useState('support');

  // Fetch dynamic support ID and Contacts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [serverContacts, supportId] = await Promise.all([
          chatApi.fetchContacts(),
          chatApi.fetchSupportAgentId()
        ]);
        
        if (supportId) {
          setRealSupportId(supportId);
        }

        let merged = Array.isArray(serverContacts) ? [...serverContacts] : [];
        const supportIndex = merged.findIndex(c => c.type === 'support' || c.id === supportId);
        
        if (supportIndex === -1 && supportId) {
          merged.unshift({ id: supportId, name: 'Customer Support', type: 'support' });
        } else if (supportIndex !== -1 && supportId) {
          merged[supportIndex].id = supportId;
          merged[supportIndex].type = 'support';
        }

        setContacts(merged);
        if (selectedPartnerId === 'support' && supportId) {
          setSelectedPartnerId(supportId);
        }
      } catch (err) {
        console.error('Error loading chat contacts:', err);
      }
    };
    loadData();
  }, []);

  const handleAddGuide = (e) => {
    e.preventDefault();
    if (!newGuideId.trim()) return;

    if (contacts.find(c => c.id === newGuideId.trim())) {
      toast.error('Guide already in contacts');
      return;
    }

    const newContact = {
      id: newGuideId.trim(),
      name: `Guide #${newGuideId.trim()}`,
      type: 'guide'
    };

    setContacts(prev => [...prev, newContact]);
    setNewGuideId('');
    setSelectedPartnerId(newContact.id);
    toast.success('Guide added to contacts');
  };

  if (!currentUserId) {
    return <div className="p-8 text-center text-slate-500">Please log in to use chat.</div>;
  }

  const activeContact = contacts.find(c => c.id === selectedPartnerId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 max-w-6xl mx-auto">
      {/* Sidebar Contacts */}
      <div className="w-80 flex flex-col gap-4">
        {/* Add Guide Form */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-600" />
            Connect with a Guide
          </h3>
          <form onSubmit={handleAddGuide} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Guide ID"
              value={newGuideId}
              onChange={(e) => setNewGuideId(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3 flex items-center justify-center transition-colors"
              title="Add Guide"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            Get a Guide ID from Customer Support to start chatting.
          </p>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800">Your Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedPartnerId(contact.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedPartnerId === contact.id ? 'bg-cyan-50 border border-cyan-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${contact.type === 'support' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                  {contact.type === 'support' ? <ShieldAlert className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`text-sm font-semibold ${selectedPartnerId === contact.id ? 'text-cyan-900' : 'text-slate-700'}`}>
                    {contact.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {contact.type === 'support' ? '24/7 Assistance' : `Guide ID: ${contact.id}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <ChatArea
        currentUserId={currentUserId}
        partnerId={selectedPartnerId}
        partnerName={activeContact?.name || 'Unknown Contact'}
      />
    </div>
  );
}