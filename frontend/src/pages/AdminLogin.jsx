import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/login`,
        { email, password }
      );

      localStorage.setItem("adminToken", res.data.token);

      alert("Admin Login Successful ✅");
      navigate("/admin");

    } catch (err) {
      alert("Login Failed ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 shadow rounded">
        <h2 className="text-xl mb-4">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-2 w-full"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-2 w-full"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white p-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
}