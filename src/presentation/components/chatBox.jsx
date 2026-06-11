import { useEffect, useState } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import {
  loadChat,
  createMessage
} from '../../services/chatService'

export default function ChatBox({
  bookingId,
  receiverId,
  currentUserId
}) {
  const [messages, setMessages] = useState([])

  const fetchMessages = async () => {
    const data = await loadChat(bookingId)
    setMessages(data)
  }

  const handleSend = async (text) => {
    await createMessage({
      booking_id: bookingId,
      receiver_id: receiverId,
      message: text
    })

    fetchMessages()
  }

  useEffect(() => {
    fetchMessages()

    const timer = setInterval(fetchMessages, 3000)

    return () => clearInterval(timer)
  }, [bookingId])

  return (
    <div>
      <div
        style={{
          height: '400px',
          overflowY: 'auto'
        }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  )
}