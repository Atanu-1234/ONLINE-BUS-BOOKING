import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function Ticket() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, bus, selectedSeats, totalAmount, date } = location.state || {};

  const busName = booking?.busName || bus?.name || "";
  const from = booking?.from || bus?.from || "";
  const to = booking?.to || bus?.to || "";
  const seats = booking?.seats || selectedSeats || [];
  const amount = booking?.totalAmount || totalAmount || 0;
  const journeyDate = booking?.journeyDate || date || bus?.date || "";
  const startTime = booking?.startTime || bus?.startTime || "";
  const bookingId = booking?._id || "";
  const bookedOn = booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : new Date().toLocaleDateString();

  if (!busName) return <p className="text-center mt-10 text-gray-500">No ticket data found</p>;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 12, 41);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BusBooking - E-Ticket", 20, 28);
    doc.setTextColor(200, 200, 255);
    doc.setFontSize(10);
    doc.text("Your journey confirmation", 20, 38);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    const lines = [
      ["Booking ID", bookingId || "N/A"],
      ["Bus Name", busName],
      ["Route", `${from} -> ${to}`],
      ["Journey Date", journeyDate],
      ["Departure Time", startTime],
      ["Seats", seats.join(", ")],
      ["Total Amount", `Rs. ${amount}`],
      ["Status", "Confirmed"],
      ["Booked On", bookedOn],
    ];
    let y = 60;
    lines.forEach(([label, value]) => {
      doc.setTextColor(150, 150, 255);
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, 20, y);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, "normal");
      doc.text(String(value), 80, y);
      y += 14;
    });
    doc.save(`BusTicket_${bookingId || "ticket"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* TICKET HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
            <div className="text-6xl mb-3">🎟️</div>
            <h1 className="text-3xl font-extrabold">Ticket Confirmed!</h1>
            <p className="text-green-300 font-semibold mt-1">✅ Booking Successful</p>
          </div>

          {/* TICKET BODY */}
          <div className="p-8 space-y-3">
            {[
              { label: "Booking ID", value: bookingId || "N/A", bg: "bg-indigo-50", text: "text-indigo-600" },
              { label: "Bus", value: busName, bg: "bg-purple-50", text: "text-purple-600" },
              { label: "Route", value: `${from} → ${to}`, bg: "bg-pink-50", text: "text-pink-600" },
              { label: "Journey Date", value: journeyDate, bg: "bg-green-50", text: "text-green-600" },
              { label: "Departure", value: startTime, bg: "bg-blue-50", text: "text-blue-600" },
              { label: "Seats", value: seats.join(", "), bg: "bg-orange-50", text: "text-orange-600" },
              { label: "Booked On", value: bookedOn, bg: "bg-gray-50", text: "text-gray-500" },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center ${row.bg} rounded-xl px-4 py-3`}>
                <span className={`text-sm font-bold ${row.text}`}>{row.label}</span>
                <span className="text-gray-800 font-semibold text-sm text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-4 py-4 text-center text-white shadow-lg">
              <p className="text-white/80 text-sm font-bold">Total Amount</p>
              <p className="text-4xl font-extrabold">₹{amount}</p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 px-8 pb-8">
            <button onClick={downloadPDF}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
              Download PDF 📄
            </button>
            <button onClick={() => navigate("/booking")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold transition">
              My Bookings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
