// Re-exporting from your service file so components can use them easily
export {
  getBookingById,
  createAdvancePayment,
  createBalancePayment, // renamed from createFullPayment to match backend
  verifyAdvancePayment,
  verifyBalancePayment
} from '../infrastructure/api/paymentService';