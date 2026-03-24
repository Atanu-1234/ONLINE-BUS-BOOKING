import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      if (res.data.role === "admin") navigate("/admin");
      else navigate("/search");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Invalid Email or Password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — decorative */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative text-center text-white">
          <div className="text-8xl mb-6">🚌</div>
          <h2 className="text-4xl font-extrabold mb-3 drop-shadow">Welcome Back!</h2>
          <p className="text-white/80 text-lg max-w-sm">Login to access your bookings and travel across India.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-xs">
            {["Safe Travel", "Easy Booking", "E-Tickets", "Best Price"].map((f) => (
              <div key={f} className="bg-white/15 border border-white/30 rounded-xl p-3 text-center text-sm font-semibold">✅ {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-3xl font-extrabold text-gray-800">Sign In</h2>
            <p className="text-gray-500 mt-1">Enter your credentials to continue</p>
          </div>

          {message && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-center py-3 px-4 rounded-xl mb-6 font-medium">
              ⚠️ {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Email Address</label>
              <input type="email" placeholder="you@example.com"
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
              <input type="password" placeholder="••••••••"
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-gray-800 placeholder-gray-400"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold text-lg transition shadow-lg disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
