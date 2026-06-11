import { useParams } from 'react-router-dom'
import ChatBox from '../../components/ChatBox'

export default function BookingChat() {
  const { bookingId } = useParams()

  return (
    <ChatBox
      bookingId={bookingId}
      receiverId={12}
      currentUserId={13}
    />
  )
}