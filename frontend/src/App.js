import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchBus from "./pages/SearchBus";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Ticket from "./pages/Ticket";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";

import Dashboard from "./admin/Dashboard";
import AddBus from "./admin/AddBus";

function ProtectedAdminRoute({ children }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedUserRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ message: "Please login to continue" }} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<ProtectedUserRoute><SearchBus /></ProtectedUserRoute>} />
        <Route path="/seats/:busId" element={<ProtectedUserRoute><SeatSelection /></ProtectedUserRoute>} />
        <Route path="/payment" element={<ProtectedUserRoute><Payment /></ProtectedUserRoute>} />
        <Route path="/ticket" element={<ProtectedUserRoute><Ticket /></ProtectedUserRoute>} />
        <Route path="/booking" element={<ProtectedUserRoute><Booking /></ProtectedUserRoute>} />
        <Route path="/profile" element={<ProtectedUserRoute><Profile /></ProtectedUserRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/add-bus"
          element={
            <ProtectedAdminRoute>
              <AddBus />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
