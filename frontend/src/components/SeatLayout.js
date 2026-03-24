import React, { useState } from "react";

const TOTAL_SEATS = 32;

function SeatLayout({ onSeatSelect }) {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatNumber) => {
    let updatedSeats;

    if (selectedSeats.includes(seatNumber)) {
      updatedSeats = selectedSeats.filter((s) => s !== seatNumber);
    } else {
      updatedSeats = [...selectedSeats, seatNumber];
    }

    setSelectedSeats(updatedSeats);
    if (onSeatSelect) onSeatSelect(updatedSeats);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">
        Select Your Seats
      </h2>

      <div className="grid grid-cols-4 gap-4 justify-items-center">
        {[...Array(TOTAL_SEATS)].map((_, index) => {
          const seatNo = index + 1;
          const isSelected = selectedSeats.includes(seatNo);

          return (
            <button
              key={seatNo}
              onClick={() => toggleSeat(seatNo)}
              className={`w-12 h-12 rounded-md font-semibold text-white
                ${isSelected ? "bg-green-600" : "bg-gray-400"}
                hover:scale-105 transition`}
            >
              {seatNo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SeatLayout;
