import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <nav className="bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] text-white shadow-2xl sticky top-0 z-50 border-b border-purple-500/30">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-cyan-900/20 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center relative">

        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold shadow-lg glow-yellow group-hover:scale-110 transition">🚌</div>
          <span className="text-2xl font-extrabold tracking-wide">
            <span className="text-white">Bus</span><span className="shimmer-text">Booking</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          {role !== "admin" && (
            <>
              {[{ to: "/", label: "Home" }, { to: "/search", label: "Search Bus" }, { to: "/booking", label: "My Bookings" }, { to: "/profile", label: "Profile" }].map((item) => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => isActive
                    ? "text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1 text-glow-yellow"
                    : "hover:text-cyan-400 transition font-medium hover:text-glow-cyan"}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
          {role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1" : "hover:text-cyan-400 transition font-medium"}>
              Admin Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {token ? (
            <>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400/40 px-3 py-1.5 rounded-full glow-purple">
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-full flex items-center justify-center font-bold text-sm">
                  {name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-purple-200">{name}</span>
              </div>
              <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-4 py-2 rounded-full font-semibold text-sm transition glow-pink shadow-lg">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-cyan-400/40 px-4 py-2 rounded-full font-semibold text-sm transition hover:glow-cyan text-cyan-300">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-4 py-2 rounded-full font-bold text-sm transition glow-yellow shadow-lg">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
