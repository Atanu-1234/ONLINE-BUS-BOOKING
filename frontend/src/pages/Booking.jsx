import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null, busName: "" });
  const [ratingModal, setRatingModal] = useState({ show: false, busId: null, busName: "", bookingId: null });
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratedBookings, setRatedBookings] = useState(() => JSON.parse(localStorage.getItem("ratedBookings") || "[]"));
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } }) // eslint-disable-line react-hooks/exhaustive-deps
      .then((res) => { setBookings(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/bookings/cancel/${cancelModal.bookingId}`,
        {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookings((prev) => prev.map((b) => b._id === cancelModal.bookingId ? res.data : b));
      setCancelModal({ show: false, bookingId: null, busName: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    }
  };

  const handleRate = async () => {
    if (!stars) { alert("Please select a star rating"); return; }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/buses/${ratingModal.busId}/rate`,
        { stars, comment }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = [...ratedBookings, ratingModal.bookingId];
      setRatedBookings(updated);
      localStorage.setItem("ratedBookings", JSON.stringify(updated));
      setRatingModal({ show: false, busId: null, busName: "", bookingId: null });
      setStars(0); setComment("");
      alert("✅ Rating submitted!");
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  const accents = [
    { header: "from-indigo-500 to-blue-600", badge: "bg-blue-100 text-blue-700", btn: "from-indigo-500 to-blue-600", border: "border-blue-200" },
    { header: "from-purple-500 to-pink-600", badge: "bg-purple-100 text-purple-700", btn: "from-purple-500 to-pink-600", border: "border-purple-200" },
    { header: "from-orange-400 to-yellow-500", badge: "bg-orange-100 text-orange-700", btn: "from-orange-400 to-yellow-500", border: "border-orange-200" },
    { header: "from-green-500 to-emerald-600", badge: "bg-green-100 text-green-700", btn: "from-green-500 to-emerald-600", border: "border-green-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <h1 className="text-5xl font-extrabold mb-2 drop-shadow">🎟️ My Bookings</h1>
          <p className="text-white/80 text-lg">View and manage all your bus bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow">
            <p className="text-6xl mb-4">🎫</p>
            <p className="text-xl font-bold text-gray-800">No bookings yet!</p>
            <p className="text-gray-500 mt-2">Book your first bus ticket to see it here.</p>
            <button onClick={() => navigate("/search")} className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
              Search Buses 🔍
            </button>
          </div>
        )}

        <div className="space-y-5">
          {bookings.map((booking, idx) => {
            const a = accents[idx % accents.length];
            const isCancelled = booking.status === "cancelled";
            const alreadyRated = ratedBookings.includes(booking._id);
            return (
              <div key={booking._id} className={`bg-white rounded-2xl overflow-hidden shadow-md border ${a.border} transition duration-300 ${isCancelled ? "opacity-70" : "hover:shadow-xl hover:-translate-y-0.5"}`}>
                <div className={`bg-gradient-to-r ${isCancelled ? "from-gray-400 to-gray-500" : a.header} px-6 py-3 flex justify-between items-center`}>
                  <span className="text-white font-bold text-sm">Booking #{idx + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCancelled ? "bg-white/20 text-white" : "bg-white/20 text-white"}`}>
                    {isCancelled ? "❌ Cancelled" : "✅ Confirmed"}
                  </span>
                </div>
                <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-gray-800">{booking.busName}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.badge}`}>{booking.from}</span>
                      <span className="text-gray-400 font-bold">→</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.badge}`}>{booking.to}</span>
                    </div>
                    <p className="text-sm text-gray-500">📅 {booking.journeyDate} &nbsp; 🕐 {booking.startTime}</p>
                    <div className="flex gap-2 flex-wrap">
                      {booking.seats.map((s) => (
                        <span key={s} className="bg-gray-100 border border-gray-300 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">Seat {s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Booked: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                    {isCancelled && booking.cancelledAt && (
                      <p className="text-xs text-red-400">Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between gap-3 min-w-[140px]">
                    <p className={`text-3xl font-extrabold ${isCancelled ? "text-gray-400 line-through" : "text-gray-800"}`}>₹{booking.totalAmount}</p>
                    <div className="flex flex-col gap-2 w-full">
                      {!isCancelled && (
                        <>
                          <button onClick={() => navigate("/ticket", { state: { booking } })}
                            className={`bg-gradient-to-r ${a.btn} text-white px-4 py-2 rounded-xl font-bold text-sm shadow hover:opacity-90`}>
                            View Ticket 📄
                          </button>
                          <button onClick={() => setCancelModal({ show: true, bookingId: booking._id, busName: booking.busName })}
                            className="bg-red-50 border border-red-200 hover:border-red-400 text-red-500 px-4 py-2 rounded-xl font-bold text-sm transition">
                            Cancel Booking
                          </button>
                          {!alreadyRated && (
                            <button onClick={() => setRatingModal({ show: true, busId: booking.busId, busName: booking.busName, bookingId: booking._id })}
                              className="bg-yellow-50 border border-yellow-300 hover:border-yellow-400 text-yellow-600 px-4 py-2 rounded-xl font-bold text-sm transition">
                              ⭐ Rate Bus
                            </button>
                          )}
                          {alreadyRated && (
                            <span className="text-center text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-4 py-2 rounded-xl">✅ Rated</span>
                          )}
                        </>
                      )}
                      {isCancelled && (
                        <span className="text-center text-xs text-gray-400 bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl font-semibold">Booking Cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CANCEL MODAL */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Cancel Booking?</h2>
              <p className="text-gray-500 mb-1">You are about to cancel</p>
              <p className="text-red-500 font-bold text-lg mb-4">"{cancelModal.busName}"</p>
              <p className="text-gray-400 text-sm mb-8">This will free up your seats. This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setCancelModal({ show: false, bookingId: null, busName: "" })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
                  Keep Booking
                </button>
                <button onClick={handleCancel}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-2xl font-extrabold text-gray-800">Rate Your Journey</h2>
              <p className="text-gray-500 mt-1">{ratingModal.busName}</p>
            </div>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setStars(s)}
                  className={`text-4xl transition hover:scale-110 ${s <= stars ? "text-yellow-400" : "text-gray-300"}`}>★</button>
              ))}
            </div>
            <textarea placeholder="Share your experience (optional)..." rows={3}
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400 resize-none mb-4"
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => { setRatingModal({ show: false, busId: null, busName: "", bookingId: null }); setStars(0); setComment(""); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
                Cancel
              </button>
              <button onClick={handleRate}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 rounded-xl font-bold transition shadow-lg">
                Submit Rating ⭐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
