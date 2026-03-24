import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, selectedSeats, totalAmount, date, from, to, pricePerSeat } = location.state || {};
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);

  if (!bus) return <p className="text-center mt-10 text-gray-500">No booking data found</p>;

  const handlePayment = async () => {
    if (!name || !cardNumber || !expiry || !cvv) { alert("Please fill all payment details"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        busId: bus._id, busName: bus.name, from: from || bus.from, to: to || bus.to,
        seats: selectedSeats, totalAmount, journeyDate: date || bus.date, startTime: bus.startTime,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/ticket", { state: { booking: res.data, bus, selectedSeats, totalAmount, date: date || bus.date } });
    } catch (err) { alert("Booking failed. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">💳 Complete Your Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SUMMARY */}
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">🎟️ Booking Summary</h2>
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs text-indigo-500 uppercase font-bold mb-1">Bus</p>
                <p className="font-bold text-lg text-gray-800">{bus.name}</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs text-purple-500 uppercase font-bold mb-1">Route</p>
                <p className="font-bold text-gray-800">{from || bus.from} <span className="text-indigo-500">→</span> {to || bus.to}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <p className="text-xs text-orange-500 uppercase font-bold mb-1">Date</p>
                  <p className="font-semibold text-gray-800 text-sm">{(date || bus.date) === "everyday" ? "Every Day" : (date || bus.date)}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs text-green-500 uppercase font-bold mb-1">Time</p>
                  <p className="font-semibold text-gray-800 text-sm">{bus.startTime}</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Seats</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedSeats.map((s) => (
                    <span key={s} className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-center text-white shadow-lg">
                <p className="text-sm font-bold text-white/80">{selectedSeats.length} seat(s) × ₹{pricePerSeat || bus.price}</p>
                <p className="text-4xl font-extrabold">₹{totalAmount}</p>
              </div>
            </div>
          </div>

          {/* PAYMENT FORM */}
          <div className="bg-white rounded-2xl shadow-xl border border-pink-100 p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">💳 Payment Details</h2>

            {/* CARD PREVIEW */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 mb-6 shadow-xl text-white">
              <p className="text-xs text-white/60 mb-1">Card Number</p>
              <p className="text-xl font-mono tracking-widest">{cardNumber ? cardNumber.replace(/(.{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}</p>
              <div className="flex justify-between mt-4">
                <div><p className="text-xs text-white/60">Card Holder</p><p className="font-semibold">{name || "YOUR NAME"}</p></div>
                <div><p className="text-xs text-white/60">Expires</p><p className="font-semibold">{expiry || "MM/YY"}</p></div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { ph: "Card Holder Name", val: name, set: setName, type: "text" },
                { ph: "Card Number (16 digits)", val: cardNumber, set: setCardNumber, type: "text", max: 16, mono: true },
              ].map((f, i) => (
                <input key={i} type={f.type} placeholder={f.ph} maxLength={f.max}
                  className={`w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400 ${f.mono ? "font-mono" : ""}`}
                  value={f.val} onChange={(e) => f.set(e.target.value)} />
              ))}
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className="p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                <input type="password" placeholder="CVV" maxLength={3} className="p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-extrabold text-lg transition shadow-lg disabled:opacity-60">
                {loading ? "Processing..." : `Pay ₹${totalAmount} Now 🔒`}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">🔒 Demo payment — no real money charged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
