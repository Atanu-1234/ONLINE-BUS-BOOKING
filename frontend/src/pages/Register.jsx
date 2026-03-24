import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, form);
      alert("✅ Registration Successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Registration Failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — decorative */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative text-center text-white">
          <div className="text-8xl mb-6">🎟️</div>
          <h2 className="text-4xl font-extrabold mb-3 drop-shadow">Join Us Today!</h2>
          <p className="text-white/80 text-lg max-w-sm">Create your account and start booking bus tickets across India.</p>
          <div className="mt-10 space-y-3 w-full max-w-xs">
            {["Free Registration", "Instant E-Tickets", "Track Bookings", "Secure Payments"].map((f) => (
              <div key={f} className="bg-white/15 border border-white/30 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <span className="text-yellow-300">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🚀</div>
            <h2 className="text-3xl font-extrabold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: "Full Name", type: "text", key: "name", placeholder: "John Doe" },
              { label: "Email Address", type: "email", key: "email", placeholder: "you@example.com" },
              { label: "Password", type: "password", key: "password", placeholder: "••••••••" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition text-gray-800 placeholder-gray-400"
                  value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required />
              </div>
            ))}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Register As</label>
              <select className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition text-gray-800"
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">👤 User</option>
                <option value="admin">🛠️ Admin</option>
              </select>
            </div>
            <button disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3.5 rounded-xl font-extrabold text-lg transition shadow-lg disabled:opacity-60 mt-2">
              {loading ? "Creating..." : "Create Account 🚀"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
