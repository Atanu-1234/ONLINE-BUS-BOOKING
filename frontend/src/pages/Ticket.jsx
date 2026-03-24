import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function Ticket() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, bus, selectedSeats, totalAmount, date } = location.state || {};

  const busName     = booking?.busName || bus?.name || "";
  const from        = booking?.from    || bus?.from  || "";
  const to          = booking?.to      || bus?.to    || "";
  const seats       = booking?.seats   || selectedSeats || [];
  const amount      = booking?.totalAmount || totalAmount || 0;
  const journeyDate = booking?.journeyDate || date || bus?.date || "";
  const startTime   = booking?.startTime   || bus?.startTime   || "";
  const bookingId   = booking?._id || "";
  const bookedOn    = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString()
    : new Date().toLocaleDateString();
  const shortId = bookingId ? bookingId.slice(-8).toUpperCase() : "N/A";

  if (!busName) return <p className="text-center mt-10 text-gray-500">No ticket data found</p>;

  /* ─── PDF ─── */
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const PW = 297, PH = 210;

    const fill = (r, g, b) => doc.setFillColor(r, g, b);
    const pen  = (r, g, b) => doc.setDrawColor(r, g, b);
    const ink  = (r, g, b) => doc.setTextColor(r, g, b);
    const bold = (s) => { doc.setFont(undefined, "bold");   doc.setFontSize(s); };
    const reg  = (s) => { doc.setFont(undefined, "normal"); doc.setFontSize(s); };

    // ── page background ──
    fill(232, 235, 248); doc.rect(0, 0, PW, PH, "F");

    // ── ticket dimensions ──
    const tX = 14, tY = 30, tW = PW - 28, tH = 112;
    const stubW = 66, mainW = tW - stubW, tearX = tX + mainW;

    // drop shadow
    fill(185, 192, 218); doc.rect(tX + 2, tY + 2, tW, tH, "F");

    // main section bg
    fill(255, 255, 255); doc.rect(tX, tY, mainW, tH, "F");
    // stub bg
    fill(244, 246, 255); doc.rect(tearX, tY, stubW, tH, "F");
    // outer border
    pen(165, 175, 210); doc.setLineWidth(0.35);
    doc.rect(tX, tY, tW, tH);

    // ════════════════════════════════
    //  MAIN SECTION
    // ════════════════════════════════

    // top header bar
    fill(67, 56, 202); doc.rect(tX, tY, mainW, 15, "F");
    ink(255, 255, 255); bold(12.5);
    doc.text("BUS TICKET", tX + 7, tY + 10.5);
    ink(180, 190, 255); reg(7);
    doc.text("OFFICIAL E-TICKET  ·  BOARDING PASS", tX + mainW - 7, tY + 10.5, { align: "right" });

    // fields — left column
    const fields = [
      ["Date",  journeyDate],
      ["Time",  startTime],
      ["Bus",   busName],
      ["Seats", seats.join(", ")],
      ["Ref",   `#${shortId}`],
      ["Price", `Rs. ${amount}`],
    ];
    let fy = tY + 26;
    fields.forEach(([label, value]) => {
      ink(115, 125, 165); reg(7.5);
      doc.text(label, tX + 7, fy);
      ink(18, 24, 52); bold(7.5);
      doc.text(`: ${value}`, tX + 25, fy);
      fy += 9.2;
    });

    // big city names at bottom of main
    const cityY = tY + tH - 18;
    ink(18, 24, 52); bold(21);
    const fromTxt = from.toUpperCase();
    const toTxt   = to.toUpperCase();
    const fromW   = doc.getTextWidth(fromTxt);
    doc.text(fromTxt, tX + 7, cityY);
    ink(67, 56, 202); bold(17);
    const arrow  = "  \u2192  ";
    doc.text(arrow, tX + 7 + fromW, cityY);
    const arrowW = doc.getTextWidth(arrow);
    ink(18, 24, 52); bold(21);
    doc.text(toTxt, tX + 7 + fromW + arrowW, cityY);

    // bottom bar
    fill(67, 56, 202); doc.rect(tX, tY + tH - 13, mainW, 13, "F");
    ink(180, 190, 255); reg(7);
    doc.text("Departure", tX + 7, tY + tH - 5.5);
    ink(255, 255, 255); bold(9);
    doc.text(startTime, tX + 33, tY + tH - 5.5);
    // confirmed badge
    fill(16, 185, 129);
    doc.roundedRect(tX + mainW - 46, tY + tH - 11, 40, 8, 2, 2, "F");
    ink(255, 255, 255); bold(7);
    doc.text("CONFIRMED", tX + mainW - 26, tY + tH - 5.5, { align: "center" });

    // ════════════════════════════════
    //  TEAR LINE
    // ════════════════════════════════
    pen(148, 158, 200); doc.setLineWidth(0.5);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.line(tearX, tY + 3, tearX, tY + tH - 3);
    doc.setLineDashPattern([], 0);
    ink(155, 165, 205); reg(9);
    doc.text("\u2702", tearX - 2.8, tY + tH / 2 + 3);

    // ════════════════════════════════
    //  STUB SECTION
    // ════════════════════════════════

    // stub top bar
    fill(67, 56, 202); doc.rect(tearX, tY, stubW, 15, "F");
    ink(255, 255, 255); bold(9);
    doc.text("BUS TICKET", tearX + stubW / 2, tY + 10.5, { align: "center" });

    // ref highlight band
    fill(220, 224, 255); doc.rect(tearX, tY + 15, stubW, 11, "F");
    ink(67, 56, 202); bold(8.5);
    doc.text(`#${shortId}`, tearX + stubW / 2, tY + 22.5, { align: "center" });

    // stub fields
    const stubFields = [
      ["Date",  journeyDate],
      ["Time",  startTime],
      ["Bus",   busName.length > 14 ? busName.slice(0, 13) + "..." : busName],
      ["Seats", seats.join(", ")],
      ["Price", `Rs. ${amount}`],
    ];
    let sy = tY + 37;
    stubFields.forEach(([label, value]) => {
      ink(115, 125, 165); reg(6.5);
      doc.text(label, tearX + 5, sy);
      ink(18, 24, 52); bold(6.5);
      doc.text(`: ${value}`, tearX + 18, sy);
      sy += 8;
    });

    // stub route
    ink(18, 24, 52); bold(7.5);
    doc.text(`${from} > ${to}`, tearX + 5, sy + 3);

    // stub bottom bar
    fill(67, 56, 202); doc.rect(tearX, tY + tH - 13, stubW, 13, "F");
    ink(200, 210, 255); bold(8);
    doc.text("BON VOYAGE", tearX + stubW / 2, tY + tH - 7.5, { align: "center" });
    ink(180, 192, 255); reg(5.5);
    doc.text("Have a safe trip", tearX + stubW / 2, tY + tH - 3, { align: "center" });

    // ── page footer ──
    ink(135, 145, 178); reg(6);
    doc.text(
      `BusBooking  |  Generated: ${new Date().toLocaleString()}`,
      PW / 2, PH - 7, { align: "center" }
    );

    doc.save(`Ticket_${shortId}.pdf`);
  };

  /* ─── UI ─── */
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* NAV */}
      <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚌</span>
          <span className="text-slate-800 font-black text-lg tracking-tight">BusBooking</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Booking Confirmed
        </div>
        <button onClick={() => navigate("/booking")}
          className="text-slate-500 hover:text-indigo-600 text-sm font-semibold transition">
          ← My Bookings
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-center justify-center gap-6 px-10 overflow-hidden">

        {/* ── TICKET ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-[400px] flex-shrink-0 overflow-hidden">

          {/* header */}
          <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest">Boarding Pass</p>
              <p className="text-white font-black text-base leading-tight mt-0.5">{busName}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-300 text-[10px] uppercase tracking-wide">Ref No.</p>
              <p className="text-white font-black text-sm font-mono">#{shortId}</p>
            </div>
          </div>

          {/* route */}
          <div className="bg-indigo-50 px-6 py-4 flex items-center gap-2 border-b border-indigo-100">
            <div className="text-center w-20">
              <p className="text-indigo-900 font-black text-2xl leading-none">{from}</p>
              <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wide mt-1">Origin</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-center w-full">
                <div className="flex-1 border-t border-dashed border-indigo-300" />
                <span className="mx-2 text-base">🚌</span>
                <div className="flex-1 border-t border-dashed border-indigo-300" />
              </div>
              <p className="text-indigo-500 text-[10px] font-semibold">{startTime}</p>
            </div>
            <div className="text-center w-20">
              <p className="text-indigo-900 font-black text-2xl leading-none">{to}</p>
              <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wide mt-1">Destination</p>
            </div>
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
            {[
              { label: "Date",      value: journeyDate      },
              { label: "Departure", value: startTime        },
              { label: "Seat(s)",   value: seats.join(", ") },
            ].map((f) => (
              <div key={f.label} className="py-3 text-center">
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-slate-800 font-black text-xs mt-1">{f.value}</p>
              </div>
            ))}
          </div>

          {/* details rows */}
          <div className="divide-y divide-slate-50">
            {[
              { label: "Bus",       value: busName           },
              { label: "Route",     value: `${from} → ${to}` },
              { label: "Issued On", value: bookedOn          },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between px-6 py-2.5">
                <p className="text-slate-400 text-xs font-medium">{r.label}</p>
                <p className="text-slate-700 font-bold text-xs">{r.value}</p>
              </div>
            ))}
          </div>

          {/* status + amount footer */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-wide">Confirmed</span>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Amount Paid</p>
              <p className="text-slate-800 font-black text-xl">₹{amount}</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col gap-4 w-64 flex-shrink-0">

          {/* summary */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Trip Summary</p>
            <div className="space-y-3">
              {[
                { label: "Booking Ref", value: `#${shortId}`, mono: true },
                { label: "Bus",         value: busName                   },
                { label: "Route",       value: `${from} → ${to}`         },
                { label: "Date",        value: journeyDate               },
                { label: "Time",        value: startTime                 },
                { label: "Seats",       value: seats.join(", ")          },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <p className="text-slate-400 text-xs">{item.label}</p>
                  <p className={`text-slate-700 font-bold text-xs ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-slate-400 text-xs font-semibold">Total Paid</p>
              <p className="text-indigo-600 font-black text-lg">₹{amount}</p>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2">
            <button onClick={downloadPDF}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-md active:scale-95 flex items-center justify-center gap-2">
              🎫 Download Ticket
            </button>
            <button onClick={() => navigate("/booking")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition active:scale-95">
              View All Bookings
            </button>
            <button onClick={() => navigate("/search")}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 py-2.5 rounded-xl font-semibold text-sm transition active:scale-95">
              Book Another Bus →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
