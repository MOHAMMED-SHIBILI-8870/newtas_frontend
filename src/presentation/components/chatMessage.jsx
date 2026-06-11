export default function ChatMessage({ message, currentUserId }) {
  const mine = message.sender_id === currentUserId

  return (
    <div
      style={{
        textAlign: mine ? 'right' : 'left',
        marginBottom: '10px'
      }}
    >
      <span
        style={{
          padding: '8px',
          borderRadius: '10px',
          display: 'inline-block',
          background: '#eee'
        }}
      >
        {message.message}
      </span>
    </div>
  )
}