import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createAdvancePayment } from "../../../infrastructure/api/paymentService";
import api from "../../../infrastructure/api/axios";

function PaymentGateway() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[DEBUG] Component mounted with bookingId:", bookingId);
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      console.log(`[DEBUG] Fetching booking details from: /bookings/${bookingId}`);
      const res = await api.get(`/bookings/${bookingId}`);
      console.log("[DEBUG] Fetching booking success. Payload data:", res.data);
      setBooking(res.data.data);
    } catch (err) {
      console.error("[DEBUG ERROR] Failed to load booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  const processRazorpayPayment = (backendOrderResponse, type) => {
    console.log(`[DEBUG] Entering processRazorpayPayment for type: '${type}'`);
    
    // Extracting out of standard response envelopes
    const payloadData = backendOrderResponse?.data || backendOrderResponse;
    console.log("[DEBUG] Extracted payloadData configurations:", payloadData);

    if (!payloadData || !payloadData.payment) {
      alert("CRITICAL: Server data envelope structure missing core 'payment' values block.");
      return;
    }

    const paymentRecord = payloadData.payment;
    const dynamicKeyId = payloadData.razorpay_key_id;

    // Handles safe cross-property checks across alternative object mapping casing patterns
    const razorpayOrderId = paymentRecord?.razorpay_order_id || paymentRecord?.RazorpayOrderID;
    const rawAmount = paymentRecord?.amount || paymentRecord?.Amount;

    console.log("[DEBUG] Verified structural parameters mapping fields:", { dynamicKeyId, razorpayOrderId, rawAmount });

    if (!razorpayOrderId) {
      alert("Verification blocked: Missing active razorpay_order_id inside transaction details.");
      return;
    }

    const options = {
      key: dynamicKeyId, // ✅ Loaded fully dynamically from backend configurations!
      amount: rawAmount * 100, // Safe local conversion parsing to sub-unit Paise metric counts
      currency: "INR",
      name: "BlinZo Travel Marketplace",
      description: `${type === "advance" ? "Advance" : "Balance"} Payment for Booking #${bookingId}`,
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          console.log("[DEBUG] Checkout window completed. Processing verify hook parameters...", response);

          const verificationPayload = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          };

          const verifyEndpoint = type === "advance"
            ? `/payments/booking/${bookingId}/advance/verify`
            : `/payments/booking/${bookingId}/balance/verify`;

          console.log(`[DEBUG] Executing signature confirmation request: POST ${verifyEndpoint}`);
          const verifyRes = await api.post(verifyEndpoint, verificationPayload);

          if (verifyRes.status === 200 || verifyRes.data?.success) {
            alert("Payment processed and verified successfully!");
            loadBooking(); // Triggers page interface updates state reload
          }
        } catch (verifyErr) {
          console.error("[DEBUG ERROR] Verification handshake error returned:", verifyErr);
          alert(`Confirmation Interrupted: ${verifyErr.response?.data?.message || "Check transaction connections."}`);
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#0891b2",
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse) {
        alert(`Payment drop log: ${failResponse.error.description}`);
      });
      rzp.open();
    } else {
      alert("Razorpay core checkout element window asset script missing from application framework context.");
    }
  };

  const payAdvance = async () => {
    try {
      console.log(`[DEBUG] Initializing advance gateway link pattern targeting booking: ${bookingId}`);
      const rawOrderData = await createAdvancePayment(bookingId);
      processRazorpayPayment(rawOrderData, "advance");
    } catch (err) {
      console.error("[DEBUG ERROR] payAdvance tracking failure exception logs:", err);
      alert(`Advance sequence generation failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const payFull = async () => {
    try {
      const targetUrl = `/payments/booking/${bookingId}/balance`;
      console.log(`[DEBUG] Initializing balance collection endpoint route: POST ${targetUrl}`);
      const res = await api.post(targetUrl);
      processRazorpayPayment(res.data, "balance");
    } catch (err) {
      console.error("[DEBUG ERROR] payFull tracking failure exception logs:", err);
      alert(`Balance sequence initialization failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading details...</h2>;
  if (!booking) return <h2 style={{ textAlign: "center", marginTop: "50px", color: "red" }}>Booking index payload failed to map correctly.</h2>;

  const trackingStatus = (booking.payment_status || "pending").toLowerCase();

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "24px", boxShadow: "0px 10px 25px rgba(0,0,0,0.03)", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#0f172a", marginBottom: "20px" }}>Payment Checkout <span style={{fontSize: "12px", color: "#64748b"}}>(Debug Engine Active)</span></h1>

      <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "25px" }}>
        <h3 style={{ marginTop: 0, color: "#334155" }}>Trip Summary</h3>
        <p><strong>Route:</strong> {booking.trip?.from || "Pending Setup"} → {booking.trip?.to || "Pending Setup"}</p>
        <p><strong>Total Value:</strong> ₹{Number(booking.final_amount || 0).toLocaleString('en-IN')}</p>
        <p><strong>Advance Component (20%):</strong> ₹{Number(booking.advance_amount || 0).toLocaleString('en-IN')}</p>
        <p style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", marginTop: "10px" }}>
          <strong>Outstanding Balance:</strong> ₹{Number(booking.balance_amount || 0).toLocaleString('en-IN')}
        </p>
        <p>
          <strong>Ledger Status:</strong>{" "}
          <span style={{ textTransform: "uppercase", fontWeight: "900", color: trackingStatus === "fully_paid" ? "#16a34a" : "#ea580c" }}>
            {booking.payment_status || "UNPAID"}
          </span>
        </p>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={payAdvance}
          disabled={trackingStatus === "advance_paid" || trackingStatus === "fully_paid"}
          style={{ flex: 1, padding: "14px 20px", fontWeight: "bold", cursor: trackingStatus === "pending" || trackingStatus === "unpaid" ? "pointer" : "not-allowed", backgroundColor: trackingStatus === "pending" || trackingStatus === "unpaid" ? "#0891b2" : "#cbd5e1", color: "white", border: "none", borderRadius: "12px" }}
        >
          Pay 20% Advance Token
        </button>

        <button
          onClick={payFull}
          disabled={trackingStatus === "fully_paid"}
          style={{ flex: 1, padding: "14px 20px", fontWeight: "bold", cursor: trackingStatus !== "fully_paid" ? "pointer" : "not-allowed", backgroundColor: trackingStatus === "fully_paid" ? "#cbd5e1" : "#16a34a", color: "white", border: "none", borderRadius: "12px" }}
        >
          {trackingStatus === "advance_paid" ? "Clear Remaining Balance" : "Pay Full Amount"}
        </button>
      </div>
    </div>
  );
}

export default PaymentGateway;