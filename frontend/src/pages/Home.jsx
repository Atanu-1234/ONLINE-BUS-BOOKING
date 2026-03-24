import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({});
  const navigate = useNavigate();

  const avgRating = (ratings = []) => {
    if (!ratings.length) return null;
    return (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);
  };
  const starBar = (avg) => "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses`)
      .then((res) => {
        setBuses(res.data);
        setLoading(false);
        if (res.data.length) {
          const ids = res.data.map((b) => b._id).join(",");
          axios.get(`${process.env.REACT_APP_API_URL}/api/buses/availability?busIds=${ids}`)
            .then((r) => setAvailability(r.data));
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBookClick = (busId) => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { state: { message: "Please login to book a bus" } });
    else navigate(`/seats/${busId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-28 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/20 backdrop-blur border border-white/30 text-white px-5 py-2 rounded-full text-sm font-bold mb-8">
            🚌 India's #1 Bus Booking Platform
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Travel <span className="text-yellow-300">Smarter</span>
            <br />
            Book <span className="text-yellow-300">Faster</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Safe, Comfortable & Affordable Bus Travel Across India 🇮🇳
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                if (!token) navigate("/login", { state: { message: "Please login to search buses" } });
                else navigate("/search");
              }}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-10 py-4 rounded-full font-extrabold text-lg transition shadow-2xl hover:shadow-yellow-400/40 hover:scale-105"
            >
              🔍 Search Buses
            </button>
            <button onClick={() => navigate("/register")}
              className="bg-white/20 backdrop-blur border border-white/40 hover:bg-white/30 text-white px-10 py-4 rounded-full font-bold text-lg transition">
              Register Free →
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🛡️", title: "Safe & Secure", desc: "All buses verified and safety checked", color: "from-blue-500 to-indigo-600", light: "bg-blue-50 border-blue-200" },
          { icon: "💺", title: "Choose Your Seat", desc: "Interactive seat map for best selection", color: "from-purple-500 to-pink-600", light: "bg-purple-50 border-purple-200" },
          { icon: "🎟️", title: "Instant E-Ticket", desc: "Download your ticket immediately", color: "from-orange-400 to-yellow-500", light: "bg-orange-50 border-orange-200" },
        ].map((f) => (
          <div key={f.title} className={`bg-white border ${f.light.split(" ")[1]} rounded-2xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300`}>
            <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>{f.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* BUS LIST */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">🚍 Available Buses</h2>
          <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-1 rounded-full text-sm font-semibold">
            {buses.length} buses
          </span>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading buses...</p>
          </div>
        )}

        {!loading && buses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow">
            <p className="text-5xl mb-4">🚌</p>
            <p className="text-gray-500 text-lg">No buses available yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {buses.map((bus, idx) => {
            const accents = [
              { badge: "bg-blue-100 text-blue-700", btn: "from-indigo-500 to-blue-600", border: "border-blue-200 hover:border-blue-400" },
              { badge: "bg-purple-100 text-purple-700", btn: "from-purple-500 to-pink-600", border: "border-purple-200 hover:border-purple-400" },
              { badge: "bg-orange-100 text-orange-700", btn: "from-orange-400 to-yellow-500", border: "border-orange-200 hover:border-orange-400" },
              { badge: "bg-green-100 text-green-700", btn: "from-green-500 to-emerald-600", border: "border-green-200 hover:border-green-400" },
            ];
            const a = accents[idx % accents.length];
            const booked = availability[bus._id] || 0;
            const avail = bus.totalSeats - booked;
            const pct = Math.round((booked / bus.totalSeats) * 100);
            const isAlmostFull = avail <= 5 && avail > 0;
            const isFull = avail === 0;
            const barColor = pct >= 80 ? "from-red-500 to-pink-500" : pct >= 50 ? "from-orange-400 to-yellow-400" : "from-green-500 to-emerald-400";
            return (
              <div key={bus._id} className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border ${a.border} transition duration-300 hover:-translate-y-1 flex flex-col`}>
                <div className="relative">
                  <img
                    src={bus.image ? (bus.image.startsWith("http") ? bus.image : `${process.env.REACT_APP_API_URL}/uploads/${bus.image}`) : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"}
                    alt="bus"
                    className="h-40 w-full object-cover"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"; }}
                  />
                  <div className={`absolute top-2 right-2 ${a.badge} text-xs font-bold px-2 py-1 rounded-full shadow`}>
                    {bus.date === "everyday" ? "🟢 Daily" : `📅 ${bus.date}`}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{bus.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="font-semibold text-indigo-600">{bus.from}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-semibold text-indigo-600">{bus.to}</span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">🕐 {bus.startTime}</p>
                  {avgRating(bus.ratings) ? (
                    <p className="text-yellow-500 text-sm font-bold mt-1">{starBar(avgRating(bus.ratings))} <span className="text-gray-500 font-normal">({bus.ratings.length})</span></p>
                  ) : (
                    <p className="text-gray-300 text-sm mt-1">☆☆☆☆☆ <span className="text-gray-400 text-xs">No ratings</span></p>
                  )}
                  <p className="text-2xl font-extrabold text-gray-800 mt-2">₹{bus.price}<span className="text-xs font-normal text-gray-400">/seat</span></p>

                  {/* AVAILABILITY BAR */}
                  <div className="mt-3">
                    {isFull && (
                      <p className="text-xs font-bold text-red-500 mb-1">🚫 Fully Booked</p>
                    )}
                    {isAlmostFull && !isFull && (
                      <p className="text-xs font-bold text-orange-500 mb-1 animate-pulse">⚠️ Only {avail} seat{avail > 1 ? "s" : ""} left!</p>
                    )}
                    {!isFull && !isAlmostFull && (
                      <p className="text-xs text-gray-400 mb-1">{avail} of {bus.totalSeats} seats available</p>
                    )}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookClick(bus._id)}
                    className={`mt-auto pt-3 w-full bg-gradient-to-r ${a.btn} text-white font-bold py-2.5 rounded-xl transition shadow hover:opacity-90 text-sm`}
                  >
                    Book Seats 🎟️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
