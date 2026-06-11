import { useParams } from 'react-router-dom'
import ChatBox from '../../components/ChatBox'

export default function BookingChat() {
  const { bookingId } = useParams()

  return (
    <ChatBox
      bookingId={bookingId}
      receiverId={13}
      currentUserId={12}
    />
  )
}