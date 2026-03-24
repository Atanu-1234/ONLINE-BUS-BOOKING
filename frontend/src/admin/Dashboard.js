import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({
    name: "", from: "", to: "", price: "", seats: "", date: "", dateType: "specific", startTime: "", image: null,
  });
  const [preview, setPreview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, busId: null, busName: "" });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [availability, setAvailability] = useState({});
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchBuses();
    axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/buses`);
      setBuses(res.data);
      if (res.data.length) {
        const ids = res.data.map((b) => b._id).join(",");
        axios.get(`${process.env.REACT_APP_API_URL}/api/buses/availability?busIds=${ids}`)
          .then((r) => setAvailability(r.data));
      }
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("from", form.from);
      formData.append("to", form.to);
      formData.append("price", form.price);
      formData.append("totalSeats", form.seats);
      formData.append("date", form.dateType === "everyday" ? "everyday" : form.date);
      formData.append("startTime", form.startTime);
      formData.append("image", form.image);

      await axios.post(`${process.env.REACT_APP_API_URL}/api/buses`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Bus Added Successfully ✅");
      setForm({ name: "", from: "", to: "", price: "", seats: "", date: "", dateType: "specific", startTime: "", image: null });
      setPreview(null);
      fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Error adding bus ❌");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/buses/${deleteModal.busId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDeleteModal({ show: false, busId: null, busName: "" });
      fetchBuses();
    } catch (err) {
      console.error(err);
      alert(err.response?.status === 401 ? "Session expired. Please login again." : "Delete Failed ❌");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <ul className="space-y-3">
          {[["dashboard", "Dashboard"], ["add", "Add Bus"], ["manage", "Manage Buses"]].map(([key, label]) => (
            <li
              key={key}
              onClick={() => setActiveSection(key)}
              className={`cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                activeSection === key 
                  ? "bg-white text-indigo-600 shadow-lg transform scale-105" 
                  : "hover:bg-white/10 hover:translate-x-1"
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border-l-4 border-indigo-500">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {activeSection === "dashboard" && "Bus Management Dashboard 🚍"}
            {activeSection === "add" && "Add New Bus 🚌"}
            {activeSection === "manage" && "Manage Buses 🗂️"}
          </h1>
        </div>

        {/* STATS CARDS */}
        {activeSection === "dashboard" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Buses", value: buses.length, icon: "🚌", color: "from-indigo-500 to-blue-600" },
              { label: "Total Bookings", value: stats.totalBookings, icon: "🎟️", color: "from-purple-500 to-pink-600" },
              { label: "Confirmed", value: stats.confirmedBookings, icon: "✅", color: "from-green-500 to-emerald-600" },
              { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: "💰", color: "from-orange-400 to-yellow-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition">
                <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 shadow`}>{s.icon}</div>
                <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* DAILY BOOKINGS TABLE */}
        {activeSection === "dashboard" && stats?.dailyData?.length > 0 && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">📈 Bookings — Last 7 Days</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="p-3 font-bold">Date</th>
                    <th className="p-3 font-bold">Bookings</th>
                    <th className="p-3 font-bold">Revenue</th>
                    <th className="p-3 font-bold">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyData.map((d, i) => (
                    <tr key={d._id} className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="p-3 font-semibold text-gray-700">{d._id}</td>
                      <td className="p-3 font-bold text-indigo-600">{d.count}</td>
                      <td className="p-3 font-bold text-green-600">₹{d.revenue}</td>
                      <td className="p-3 w-48">
                        <div className="bg-gray-100 rounded-full h-3">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full" style={{ width: `${Math.min((d.count / Math.max(...stats.dailyData.map(x => x.count))) * 100, 100)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD BUS FORM */}
        <div className={`bg-white shadow-xl rounded-2xl p-8 mb-10 border border-gray-200 ${
          activeSection === "dashboard" || activeSection === "add" ? "" : "hidden"
        }`}>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
            <span className="text-3xl">➕</span> Add New Bus
          </h2>

          <form onSubmit={handleAddBus} className="grid md:grid-cols-3 gap-5">
            <input type="text" name="name" placeholder="Bus Name" value={form.name} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            <input type="text" name="from" placeholder="From" value={form.from} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            <input type="text" name="to" placeholder="To" value={form.to} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            <input type="number" name="price" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            <input type="number" name="seats" placeholder="Total Seats" value={form.seats} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />

            <select
              name="dateType"
              value={form.dateType}
              onChange={handleChange}
              className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            >
              <option value="specific">Specific Date</option>
              <option value="everyday">Every Day</option>
            </select>

            {form.dateType === "specific" && (
              <input type="date" name="date" value={form.date} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            )}

            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" required />
            <input type="file" name="image" accept="image/*" onChange={handleChange} className="p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100" required />

            {preview && (
              <div className="col-span-3">
                <img src={preview} alt="Preview" className="w-48 h-32 object-cover rounded-xl shadow-lg border-2 border-indigo-200" />
              </div>
            )}

            <button type="submit" className="col-span-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 font-bold hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all">
              ✅ Add Bus
            </button>
          </form>
        </div>

        {/* BUS TABLE */}
        <div className={`bg-white shadow-xl rounded-2xl p-8 border border-gray-200 ${
          activeSection === "dashboard" || activeSection === "manage" ? "" : "hidden"
        }`}>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
            <span className="text-3xl">🚌</span> All Buses
          </h2>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <th className="p-4 font-bold">Image</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Route</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Time</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Seats</th>
                  <th className="p-4 font-bold">Availability</th>
                  <th className="p-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus, idx) => (
                  <tr key={bus._id} className={`border-b transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50`}>
                    <td className="p-4">
                      {bus.image && (
                        <img src={`${process.env.REACT_APP_API_URL}/uploads/${bus.image}`} alt="Bus" className="w-24 h-16 object-cover rounded-lg shadow-md" />
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-800">{bus.name}</td>
                    <td className="p-4 text-gray-700">{bus.from} → {bus.to}</td>
                    <td className="p-4">
                      {bus.date === "everyday" ? (
                        <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">Every Day</span>
                      ) : (
                        <span className="text-gray-700 font-medium">{bus.date}</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{bus.startTime}</td>
                    <td className="p-4 text-indigo-600 font-bold text-lg">₹{bus.price}</td>
                    <td className="p-4 text-gray-700 font-medium">{bus.totalSeats}</td>
                    <td className="p-4 w-36">
                      {(() => {
                        const booked = availability[bus._id] || 0;
                        const avail = bus.totalSeats - booked;
                        const pct = Math.round((booked / bus.totalSeats) * 100);
                        const barColor = pct >= 80 ? "from-red-500 to-pink-500" : pct >= 50 ? "from-orange-400 to-yellow-400" : "from-green-500 to-emerald-400";
                        return (
                          <div>
                            <p className={`text-xs font-bold mb-1 ${pct >= 80 ? "text-red-500" : pct >= 50 ? "text-orange-500" : "text-green-600"}`}>
                              {avail}/{bus.totalSeats} free
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className={`h-2 rounded-full bg-gradient-to-r ${barColor}`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setDeleteModal({ show: true, busId: bus._id, busName: bus.name })}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Delete Bus?</h2>
              <p className="text-gray-500 mb-1">You are about to delete</p>
              <p className="text-red-600 font-bold text-lg mb-6">"{deleteModal.busName}"</p>
              <p className="text-gray-400 text-sm mb-8">This action cannot be undone. All booking data for this bus will remain but the bus will no longer be available.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal({ show: false, busId: null, busName: "" })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
