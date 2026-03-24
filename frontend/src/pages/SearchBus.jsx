import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SearchBus() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [availability, setAvailability] = useState({});

  const avgRating = (ratings = []) => {
    if (!ratings.length) return null;
    return (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);
  };
  const starBar = (avg) => "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));

  const fetchAvailability = (busList, searchDate = "") => {
    if (!busList.length) return;
    const ids = busList.map((b) => b._id).join(",");
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses/availability?busIds=${ids}&date=${searchDate}`)
      .then((r) => setAvailability(r.data));
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses`)
      .then((res) => { setBuses(res.data); setLoading(false); fetchAvailability(res.data); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setSearched(true);
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/buses?from=${from}&to=${to}&date=${date}`);
    setBuses(res.data); setLoading(false);
    fetchAvailability(res.data, date);
  };

  const handleReset = async () => {
    setFrom(""); setTo(""); setDate(""); setSearched(false); setLoading(true);
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/buses`);
    setBuses(res.data); setLoading(false);
    fetchAvailability(res.data);
  };

  const accents = [
    { border: "border-blue-200 hover:border-blue-400", badge: "bg-blue-100 text-blue-700", btn: "from-indigo-500 to-blue-600" },
    { border: "border-purple-200 hover:border-purple-400", badge: "bg-purple-100 text-purple-700", btn: "from-purple-500 to-pink-600" },
    { border: "border-orange-200 hover:border-orange-400", badge: "bg-orange-100 text-orange-700", btn: "from-orange-400 to-yellow-500" },
    { border: "border-green-200 hover:border-green-400", badge: "bg-green-100 text-green-700", btn: "from-green-500 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <h1 className="text-5xl font-extrabold mb-2 drop-shadow">🔍 Search Buses</h1>
          <p className="text-white/80 text-lg">Find the perfect bus for your journey</p>
        </div>
      </div>

      {/* SEARCH FORM */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
            {[
              { label: "From", val: from, set: setFrom, ph: "e.g. Kolkata" },
              { label: "To", val: to, set: setTo, ph: "e.g. Delhi" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{f.label}</label>
                <input type="text" placeholder={f.ph}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400"
                  value={f.val} onChange={(e) => f.set(e.target.value)} />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
              <input type="date"
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800"
                value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                Search 🔍
              </button>
              {searched && (
                <button type="button" onClick={handleReset} className="w-full bg-red-50 border border-red-200 hover:border-red-400 text-red-500 py-2 rounded-xl font-semibold text-sm transition">
                  ✕ Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-5xl mx-auto px-6 mt-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800">
            {searched ? "🎯 Search Results" : "🚍 All Available Buses"}
          </h2>
          {!loading && <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-1 rounded-full text-sm font-semibold">{buses.length} buses</span>}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Searching buses...</p>
          </div>
        )}

        {!loading && buses.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-gray-600 text-lg font-semibold">No buses found.</p>
            {searched && <button onClick={handleReset} className="mt-4 text-indigo-600 font-bold hover:underline">Clear filters</button>}
          </div>
        )}

        <div className="space-y-5">
          {buses.map((bus, idx) => {
            const a = accents[idx % accents.length];
            const booked = availability[bus._id] || 0;
            const avail = bus.totalSeats - booked;
            const pct = Math.round((booked / bus.totalSeats) * 100);
            const isAlmostFull = avail <= 5 && avail > 0;
            const isFull = avail === 0;
            const barColor = pct >= 80 ? "from-red-500 to-pink-500" : pct >= 50 ? "from-orange-400 to-yellow-400" : "from-green-500 to-emerald-400";
            return (
              <div key={bus._id} className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border ${a.border} transition duration-300 hover:-translate-y-0.5`}>
                <div className="flex flex-col md:flex-row">
                  <img
                    src={bus.image ? `${process.env.REACT_APP_API_URL}/uploads/${bus.image}` : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"}
                    alt="bus" className="w-full md:w-52 h-40 object-cover"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"; }}
                  />
                  <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-800">{bus.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.badge}`}>{bus.from}</span>
                        <span className="text-gray-400 font-bold text-lg">→</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.badge}`}>{bus.to}</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📅 {bus.date === "everyday" ? <span className="text-green-600 font-bold">Every Day</span> : bus.date}</span>
                        <span>🕐 {bus.startTime}</span>
                        <span>💺 {bus.totalSeats} seats</span>
                      </div>
                      {avgRating(bus.ratings) ? (
                        <p className="text-yellow-500 text-sm font-bold mt-1">{starBar(avgRating(bus.ratings))} <span className="text-gray-500 font-normal text-xs">({bus.ratings.length} reviews)</span></p>
                      ) : (
                        <p className="text-gray-300 text-sm mt-1">☆☆☆☆☆ <span className="text-gray-400 text-xs">No ratings yet</span></p>
                      )}

                      {/* AVAILABILITY BAR */}
                      <div className="mt-3 max-w-xs">
                        {isFull && <p className="text-xs font-bold text-red-500 mb-1">🚫 Fully Booked</p>}
                        {isAlmostFull && !isFull && <p className="text-xs font-bold text-orange-500 mb-1 animate-pulse">⚠️ Only {avail} seat{avail > 1 ? "s" : ""} left!</p>}
                        {!isFull && !isAlmostFull && <p className="text-xs text-gray-400 mb-1">{avail} of {bus.totalSeats} seats available</p>}
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-3xl font-extrabold text-gray-800">₹{bus.price}</p>
                      <p className="text-xs text-gray-400 mb-3">per seat</p>
                      <Link to={`/seats/${bus._id}`} state={{ date }}
                        className={`inline-block bg-gradient-to-r ${a.btn} text-white px-8 py-2.5 rounded-xl font-bold transition shadow-lg hover:opacity-90`}>
                        Book Now 🎟️
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
