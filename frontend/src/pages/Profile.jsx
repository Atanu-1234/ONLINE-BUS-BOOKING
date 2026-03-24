import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, spent: 0 });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { setUser(res.data); setForm({ name: res.data.name, email: res.data.email, password: "" }); });

    axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const bookings = res.data;
        const confirmed = bookings.filter((b) => b.status !== "cancelled");
        setStats({
          total: bookings.length,
          confirmed: confirmed.length,
          cancelled: bookings.filter((b) => b.status === "cancelled").length,
          spent: confirmed.reduce((sum, b) => sum + b.totalAmount, 0),
        });
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      localStorage.setItem("name", res.data.name);
      setEditing(false);
      setForm((f) => ({ ...f, password: "" }));
      alert("✅ Profile updated!");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
    setSaving(false);
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 border-4 border-white/40 rounded-full flex items-center justify-center text-5xl font-extrabold mx-auto mb-4 shadow-xl">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-4xl font-extrabold drop-shadow">{user.name}</h1>
          <p className="text-white/80 mt-1">{user.email}</p>
          <span className="inline-block mt-2 bg-white/20 border border-white/30 px-4 py-1 rounded-full text-sm font-semibold capitalize">{user.role}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: stats.total, icon: "🎟️", color: "from-indigo-500 to-blue-600" },
            { label: "Confirmed", value: stats.confirmed, icon: "✅", color: "from-green-500 to-emerald-600" },
            { label: "Cancelled", value: stats.cancelled, icon: "❌", color: "from-red-400 to-pink-500" },
            { label: "Total Spent", value: `₹${stats.spent}`, icon: "💰", color: "from-orange-400 to-yellow-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition">
              <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 shadow`}>{s.icon}</div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* EDIT PROFILE */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">👤 Profile Details</h2>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-600 px-5 py-2 rounded-xl font-bold text-sm transition">
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              {[
                { label: "Full Name", value: user.name, icon: "👤" },
                { label: "Email Address", value: user.email, icon: "📧" },
                { label: "Role", value: user.role, icon: "🛡️" },
                { label: "Password", value: "••••••••", icon: "🔒" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">{f.label}</p>
                    <p className="text-gray-800 font-semibold capitalize">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
                { label: "Email Address", key: "email", type: "email", placeholder: "your@email.com" },
                { label: "New Password", key: "password", type: "password", placeholder: "Leave blank to keep current" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400"
                    value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.key !== "password"} />
                </div>
              ))}
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => { setEditing(false); setForm({ name: user.name, email: user.email, password: "" }); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes ✅"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
