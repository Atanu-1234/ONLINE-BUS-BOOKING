import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function SeatSelection() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const travelDate = location.state?.date || "";
  const travelFrom  = location.state?.from || "";
  const travelTo    = location.state?.to   || "";
  const calculatedPrice = location.state?.calculatedPrice || null;
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchSeats = useCallback(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/seats/${busId}?date=${travelDate}`)
      .then((res) => { setBookedSeats(res.data); setLastRefreshed(new Date()); });
  }, [busId, travelDate]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses/${busId}`).then((res) => setBus(res.data));
    fetchSeats();
    // poll every 15 seconds for real-time updates
    const interval = setInterval(fetchSeats, 15000);
    return () => clearInterval(interval);
  }, [busId, fetchSeats]);

  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    else setSelectedSeats([...selectedSeats, seat]);
  };

  if (!bus) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading bus details...</p>
      </div>
    </div>
  );

  const totalSeats = bus.totalSeats;
  const bookedCount = bookedSeats.length;
  const availableCount = totalSeats - bookedCount;
  const filledPct = Math.round((bookedCount / totalSeats) * 100);
  const isAlmostFull = availableCount <= 5 && availableCount > 0;
  const isFull = availableCount === 0;
  const pricePerSeat = calculatedPrice || (bus ? bus.price : 0);
  const totalAmount = selectedSeats.length * pricePerSeat;

  // progress bar color based on fill level
  const barColor = filledPct >= 80 ? "from-red-500 to-pink-500"
    : filledPct >= 50 ? "from-orange-400 to-yellow-500"
    : "from-green-500 to-emerald-500";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* BUS INFO */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-6 shadow-xl">
          <h2 className="text-3xl font-extrabold">{bus.name}</h2>
          <div className="flex justify-center items-center gap-3 mt-3 text-lg">
            <span className="bg-white/20 border border-white/30 px-4 py-1 rounded-full font-semibold">{travelFrom || bus.from}</span>
            <span className="text-yellow-300 font-bold text-2xl">→</span>
            <span className="bg-white/20 border border-white/30 px-4 py-1 rounded-full font-semibold">{travelTo || bus.to}</span>
          </div>
          <div className="flex justify-center gap-6 mt-3 text-sm text-white/80">
            <span>📅 {bus.date === "everyday" ? <span className="text-green-300 font-bold">Every Day</span> : travelDate || bus.date}</span>
            <span>🕐 {bus.startTime}</span>
          </div>
          <p className="text-yellow-300 font-extrabold text-xl mt-2">₹{pricePerSeat} per seat{calculatedPrice && calculatedPrice !== bus.price ? <span className="text-white/60 text-sm font-normal ml-2">(full route ₹{bus.price})</span> : ""}</p>
        </div>

        {/* AVAILABILITY COUNTER CARD */}
        <div className={`rounded-2xl p-5 mb-6 shadow-lg border-2 ${
          isFull ? "bg-red-50 border-red-300"
          : isAlmostFull ? "bg-orange-50 border-orange-300"
          : "bg-white border-gray-200"
        }`}>
          {/* warning banner */}
          {isFull && (
            <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-xl mb-4 font-bold">
              <span className="text-2xl">🚫</span>
              <span>This bus is fully booked! No seats available.</span>
            </div>
          )}
          {isAlmostFull && !isFull && (
            <div className="flex items-center gap-3 bg-orange-400 text-white px-4 py-3 rounded-xl mb-4 font-bold animate-pulse">
              <span className="text-2xl">⚠️</span>
              <span>Only {availableCount} seat{availableCount > 1 ? "s" : ""} left! Book fast.</span>
            </div>
          )}

          {/* counts row */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-gray-800">{totalSeats}</p>
                <p className="text-xs text-gray-500 font-semibold">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-red-500">{bookedCount}</p>
                <p className="text-xs text-gray-500 font-semibold">Booked</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-extrabold ${isFull ? "text-red-500" : isAlmostFull ? "text-orange-500" : "text-green-600"}`}>{availableCount}</p>
                <p className="text-xs text-gray-500 font-semibold">Available</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${isFull ? "text-red-500" : isAlmostFull ? "text-orange-500" : "text-green-600"}`}>
                {filledPct}% filled
              </p>
              {lastRefreshed && (
                <button onClick={fetchSeats} className="text-xs text-indigo-500 hover:underline mt-1 block">
                  🔄 Refresh
                </button>
              )}
            </div>
          </div>

          {/* progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
              style={{ width: `${filledPct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
            <span>0</span>
            <span>{Math.floor(totalSeats / 2)}</span>
            <span>{totalSeats}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* LEGEND */}
          <div className="flex justify-center gap-8 mb-8">
            {[
              { color: "bg-gray-100 border border-gray-300", label: "Available", text: "text-gray-600" },
              { color: "bg-indigo-500", label: "Selected", text: "text-indigo-600" },
              { color: "bg-red-400", label: "Booked", text: "text-red-500" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-8 h-8 ${l.color} rounded-lg`}></div>
                <span className={`text-sm font-semibold ${l.text}`}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* DRIVER */}
          <div className="flex justify-end mb-4">
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-xl px-6 py-2 text-sm font-semibold">🚗 Driver</div>
          </div>

          {/* SEATS */}
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
            {[...Array(totalSeats)].map((_, i) => {
              const seatNumber = i + 1;
              const isSelected = selectedSeats.includes(seatNumber);
              const isBooked = bookedSeats.includes(seatNumber);
              return (
                <button key={seatNumber} disabled={isBooked} onClick={() => toggleSeat(seatNumber)}
                  className={`p-3 rounded-xl text-sm font-bold transition duration-200
                    ${isBooked ? "bg-red-400 text-white cursor-not-allowed opacity-80"
                      : isSelected ? "bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-200"
                      : "bg-gray-100 border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600"}`}>
                  {isBooked ? "✗" : isSelected ? "✓" : seatNumber}
                </button>
              );
            })}
          </div>

          {/* SUMMARY */}
          {selectedSeats.length > 0 ? (
            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Selected Seats</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedSeats.map((s) => (
                      <span key={s} className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{selectedSeats.length} seat(s) × ₹{pricePerSeat}</p>
                  <p className="text-4xl font-extrabold text-gray-800">₹{totalAmount}</p>
                </div>
              </div>
              <button onClick={() => navigate("/payment", { state: { bus, selectedSeats, totalAmount, date: travelDate, from: travelFrom, to: travelTo, pricePerSeat } })}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 rounded-xl font-extrabold text-lg transition shadow-lg">
                Proceed to Payment 💳
              </button>
            </div>
          ) : (
            !isFull && <p className="text-center text-gray-400 mt-8 font-medium">👆 Click on a seat to select it</p>
          )}
        </div>
      </div>
    </div>
  );
}
