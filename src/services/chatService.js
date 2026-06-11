import * as chatApi from '../infrastructure/api/chatApi'

export const loadChat = async (bookingId) => {
  const res = await chatApi.getBookingChat(bookingId)
  return res.data.data || []
}

export const createMessage = async (payload) => {
  const res = await chatApi.sendMessage(payload)
  return res.data.data
}