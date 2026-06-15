import React, { useState, useEffect } from 'react'
import { usePermission } from '../../../hooks/usePermission'
import { useChat } from '../../../hooks/useChat'
import { Search, Plus, UserCircle, ShieldAlert, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { chatApi } from '../../../infrastructure/api/chatApi'

const ChatArea = ({ currentUserId, partnerId, partnerName }) => {
  const { messages, connectionStatus, loadingHistory, isPartnerOnline, sendMessage } = useChat(
    currentUserId,
    partnerId
  )
  const [text, setText] = useState('')
  const messagesEndRef = React.useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(text)
    setText('')
  }

  if (!partnerId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 rounded-2xl border border-white/10 p-12">
        <MessageCircle className="h-16 w-16 text-white/20 mb-4" />
        <h3 className="text-lg font-bold text-white">Select a Conversation</h3>
        <p className="text-sm text-white/50">Choose a contact from the sidebar to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-400 text-slate-950">
            {partnerId === 'support' ? <ShieldAlert className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-bold text-white">{partnerName}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : 'bg-white/20'}`}></span>
              <span className="text-xs font-semibold text-white/50">{isPartnerOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/35">
            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = String(msg.sender_id) === String(currentUserId)
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-yellow-400 text-slate-950 rounded-br-sm shadow-lg shadow-yellow-500/10 font-medium'
                      : 'bg-white/5 border border-white/10 text-white rounded-bl-sm shadow-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/80 border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 text-white transition-all placeholder-white/30"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            type="submit"
            disabled={!text.trim() || connectionStatus !== 'connected'}
            className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Chat() {
  const { user } = usePermission()
  const currentUserId = user?.id || user?.sub

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('chat_contacts')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse contacts', e)
      }
    }
    return [{ id: 'support', name: 'Customer Support', type: 'support' }]
  })

  const [selectedPartnerId, setSelectedPartnerId] = useState('support')
  const [newGuideId, setNewGuideId] = useState('')
  const [realSupportId, setRealSupportId] = useState('support')

  useEffect(() => {
    const fetchSupportId = async () => {
      const id = await chatApi.fetchSupportAgentId()
      if (id) {
        setRealSupportId(id)
        setContacts((prev) => {
          const updated = [...prev]
          const supportIndex = updated.findIndex((c) => c.type === 'support')
          if (supportIndex !== -1) {
            updated[supportIndex] = { ...updated[supportIndex], id }
          } else {
            updated.unshift({ id, name: 'Customer Support', type: 'support' })
          }
          return updated
        })
        if (selectedPartnerId === 'support') {
          setSelectedPartnerId(id)
        }
      }
    }
    void fetchSupportId()
  }, [])

  useEffect(() => {
    localStorage.setItem('chat_contacts', JSON.stringify(contacts))
  }, [contacts])

  const handleAddGuide = (e) => {
    e.preventDefault()
    if (!newGuideId.trim()) return

    if (contacts.find((c) => c.id === newGuideId.trim())) {
      toast.error('Guide already in contacts')
      return
    }

    const newContact = {
      id: newGuideId.trim(),
      name: `Guide #${newGuideId.trim()}`,
      type: 'guide',
    }

    setContacts((prev) => [...prev, newContact])
    setNewGuideId('')
    setSelectedPartnerId(newContact.id)
    toast.success('Guide added to contacts')
  }

  if (!currentUserId) {
    return <div className="p-8 text-center text-white/60">Please log in to use chat.</div>
  }

  const activeContact = contacts.find((c) => c.id === selectedPartnerId)

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6 max-w-6xl mx-auto">
      {/* Sidebar Contacts */}
      <div className="w-80 flex flex-col gap-4">
        {/* Add Guide Form */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-yellow-400" />
            Connect with a Guide
          </h3>
          <form onSubmit={handleAddGuide} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Guide ID"
              value={newGuideId}
              onChange={(e) => setNewGuideId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 text-white placeholder-white/30"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl px-3 flex items-center justify-center transition-colors shadow-md shadow-yellow-500/10"
              title="Add Guide"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Contacts List */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/10 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-slate-950/60">
            <h3 className="text-sm font-semibold text-white">Your Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedPartnerId(contact.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedPartnerId === contact.id
                    ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-lg shadow-yellow-500/5'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-xl ${
                    contact.type === 'support' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/70'
                  }`}
                >
                  {contact.type === 'support' ? <ShieldAlert className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1 text-left">
                  <h4
                    className={`text-sm font-bold ${
                      selectedPartnerId === contact.id ? 'text-yellow-400' : 'text-white/85'
                    }`}
                  >
                    {contact.name}
                  </h4>
                  <p className="text-xs text-white/50 truncate">
                    {contact.type === 'support' ? '24/7 Support Desk' : `Guide ID: ${contact.id}`}
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
  )
}
