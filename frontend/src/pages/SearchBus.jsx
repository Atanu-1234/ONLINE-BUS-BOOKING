import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SearchBus() {
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");
  const [date, setDate]         = useState("");
  const [buses, setBuses]       = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searched, setSearched] = useState(false);
  const [availability, setAvailability] = useState({});
  const [cities, setCities]     = useState([]);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen]     = useState(false);
  const [fromQ, setFromQ]       = useState("");
  const [toQ, setToQ]           = useState("");

  const avgRating = (ratings = []) => {
    if (!ratings.length) return null;
    return (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);
  };
  const starBar = (avg) => "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));

  // calculate price based on stop positions
  const calcPrice = (bus, userFrom, userTo) => {
    const stops = bus.stops && bus.stops.length >= 2 ? bus.stops : [bus.from, bus.to];
    const fi = stops.findIndex((s) => s.toLowerCase() === userFrom.toLowerCase());
    const ti = stops.findIndex((s) => s.toLowerCase() === userTo.toLowerCase());
    if (fi === -1 || ti === -1 || fi >= ti) return bus.price;
    const totalSegments = stops.length - 1;
    const userSegments  = ti - fi;
    return Math.round((userSegments / totalSegments) * bus.price);
  };

  const fetchAvailability = (busList, searchDate = "") => {
    if (!busList.length) return;
    const ids = busList.map((b) => b._id).join(",");
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses/availability?busIds=${ids}&date=${searchDate}`)
      .then((r) => setAvailability(r.data));
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses/cities`)
      .then((r) => setCities(r.data))
      .catch(() => {});
    axios.get(`${process.env.REACT_APP_API_URL}/api/buses`)
      .then((res) => { setAllBuses(res.data); setBuses(res.data); setLoading(false); fetchAvailability(res.data); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const filtered = allBuses.filter((bus) => {
      const stops = bus.stops && bus.stops.length >= 2 ? bus.stops : [bus.from, bus.to];
      const fi = from ? stops.findIndex((s) => s.toLowerCase() === from.toLowerCase()) : 0;
      const ti = to   ? stops.findIndex((s) => s.toLowerCase() === to.toLowerCase())   : stops.length - 1;
      const routeMatch = (!from && !to) || (fi !== -1 && ti !== -1 && fi < ti);
      const dateMatch  = !date || bus.date === date || bus.date === "everyday";
      return routeMatch && dateMatch;
    });
    setBuses(filtered);
    fetchAvailability(filtered, date);
  };

  const handleReset = () => {
    setFrom(""); setTo(""); setDate(""); setSearched(false);
    setFromQ(""); setToQ("");
    setBuses(allBuses);
    fetchAvailability(allBuses);
  };

  const filteredFrom = cities.filter((c) => c.toLowerCase().includes(fromQ.toLowerCase()) && c !== to);
  const filteredTo   = cities.filter((c) => c.toLowerCase().includes(toQ.toLowerCase())  && c !== from);

  const accents = [
    { border: "border-blue-200 hover:border-blue-400",   badge: "bg-blue-100 text-blue-700",   btn: "from-indigo-500 to-blue-600"   },
    { border: "border-purple-200 hover:border-purple-400", badge: "bg-purple-100 text-purple-700", btn: "from-purple-500 to-pink-600"  },
    { border: "border-orange-200 hover:border-orange-400", badge: "bg-orange-100 text-orange-700", btn: "from-orange-400 to-yellow-500" },
    { border: "border-green-200 hover:border-green-400",  badge: "bg-green-100 text-green-700",  btn: "from-green-500 to-emerald-600" },
  ];

  const CityDropdown = ({ label, value, setValue, open, setOpen, query, setQuery, options }) => (
    <div className="relative">
      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
      <button type="button"
        onClick={() => { setOpen(!open); setQuery(""); }}
        className={`w-full p-3 bg-gray-50 border-2 rounded-xl text-left transition flex items-center justify-between
          ${open ? "border-indigo-500 ring-2 ring-indigo-100" : "border-gray-200 hover:border-indigo-300"}
          ${value ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
        <span>{value || `Select ${label}`}</span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Search city..."
              value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-400" />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {value && (
              <button type="button" onClick={() => { setValue(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium border-b border-gray-50">
                ✕ Clear selection
              </button>
            )}
            {options.length === 0
              ? <p className="px-4 py-3 text-sm text-gray-400">No cities found</p>
              : options.map((city) => (
                <button key={city} type="button"
                  onClick={() => { setValue(city); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700
                    ${value === city ? "bg-indigo-50 text-indigo-700" : "text-gray-700"}`}>
                  📍 {city}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => { setFromOpen(false); setToOpen(false); }}>

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <h1 className="text-5xl font-extrabold mb-2 drop-shadow">🔍 Search Buses</h1>
          <p className="text-white/80 text-lg">Find the perfect bus for your journey</p>
        </div>
      </div>

      {/* SEARCH FORM */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">

            <CityDropdown label="From" value={from} setValue={setFrom}
              open={fromOpen} setOpen={setFromOpen} query={fromQ} setQuery={setFromQ} options={filteredFrom} />

            <CityDropdown label="To" value={to} setValue={setTo}
              open={toOpen} setOpen={setToOpen} query={toQ} setQuery={setToQ} options={filteredTo} />

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
              <input type="date"
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800"
                value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="flex flex-col justify-end gap-2">
              <button type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                Search 🔍
              </button>
              {searched && (
                <button type="button" onClick={handleReset}
                  className="w-full bg-red-50 border border-red-200 hover:border-red-400 text-red-500 py-2 rounded-xl font-semibold text-sm transition">
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
          {!loading && (
            <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-1 rounded-full text-sm font-semibold">
              {buses.length} buses
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Loading buses...</p>
          </div>
        )}

        {!loading && buses.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-gray-600 text-lg font-semibold">No buses found for this route.</p>
            {searched && <button onClick={handleReset} className="mt-4 text-indigo-600 font-bold hover:underline">Clear filters</button>}
          </div>
        )}

        <div className="space-y-5">
          {buses.map((bus, idx) => {
            const a       = accents[idx % accents.length];
            const booked  = availability[bus._id] || 0;
            const avail   = bus.totalSeats - booked;
            const pct     = Math.round((booked / bus.totalSeats) * 100);
            const isAlmostFull = avail <= 5 && avail > 0;
            const isFull  = avail === 0;
            const barColor = pct >= 80 ? "from-red-500 to-pink-500" : pct >= 50 ? "from-orange-400 to-yellow-400" : "from-green-500 to-emerald-400";
            const stops   = bus.stops && bus.stops.length >= 2 ? bus.stops : [bus.from, bus.to];
            const displayPrice = (from && to) ? calcPrice(bus, from, to) : bus.price;
            const isPartial = displayPrice !== bus.price;

            return (
              <div key={bus._id} className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border ${a.border} transition duration-300 hover:-translate-y-0.5`}>
                <div className="flex flex-col md:flex-row">
                  <img
                    src={bus.image ? (bus.image.startsWith("http") ? bus.image : `${process.env.REACT_APP_API_URL}/uploads/${bus.image}`) : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"}
                    alt="bus" className="w-full md:w-52 h-40 object-cover"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"; }}
                  />
                  <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold text-gray-800">{bus.name}</h3>

                      {/* STOPS ROUTE DISPLAY */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {stops.map((stop, i) => {
                          const isUserFrom = from && stop.toLowerCase() === from.toLowerCase();
                          const isUserTo   = to   && stop.toLowerCase() === to.toLowerCase();
                          return (
                            <span key={i} className="flex items-center gap-1">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border transition
                                ${isUserFrom ? "bg-green-100 text-green-700 border-green-300 ring-1 ring-green-400"
                                  : isUserTo ? "bg-red-100 text-red-700 border-red-300 ring-1 ring-red-400"
                                  : `${a.badge} border-transparent`}`}>
                                {stop}
                              </span>
                              {i < stops.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📅 {bus.date === "everyday" ? <span className="text-green-600 font-bold">Every Day</span> : bus.date}</span>
                        <span>🕐 {bus.startTime}</span>
                        <span>💺 {bus.totalSeats} seats</span>
                      </div>

                      {avgRating(bus.ratings) ? (
                        <p className="text-yellow-500 text-sm font-bold mt-1">
                          {starBar(avgRating(bus.ratings))}
                          <span className="text-gray-500 font-normal text-xs ml-1">({bus.ratings.length} reviews)</span>
                        </p>
                      ) : (
                        <p className="text-gray-300 text-sm mt-1">☆☆☆☆☆ <span className="text-gray-400 text-xs">No ratings yet</span></p>
                      )}

                      {/* AVAILABILITY BAR */}
                      <div className="mt-3 max-w-xs">
                        {isFull       && <p className="text-xs font-bold text-red-500 mb-1">🚫 Fully Booked</p>}
                        {isAlmostFull && !isFull && <p className="text-xs font-bold text-orange-500 mb-1 animate-pulse">⚠️ Only {avail} seat{avail > 1 ? "s" : ""} left!</p>}
                        {!isFull && !isAlmostFull && <p className="text-xs text-gray-400 mb-1">{avail} of {bus.totalSeats} seats available</p>}
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="text-center md:text-right flex-shrink-0">
                      <p className="text-3xl font-extrabold text-gray-800">₹{displayPrice}</p>
                      {isPartial
                        ? <p className="text-xs text-indigo-500 font-semibold mb-1">for your route <span className="line-through text-gray-400">₹{bus.price}</span></p>
                        : <p className="text-xs text-gray-400 mb-3">per seat (full route)</p>
                      }
                      <Link
                        to={`/seats/${bus._id}`}
                        state={{ date, from: from || bus.from, to: to || bus.to, calculatedPrice: displayPrice }}
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
