import { Link } from "react-router-dom";

export default function BusCard({ bus }) {
  return (
    <div className="border rounded-xl p-5 shadow-md bg-white">
      <h2 className="font-bold text-lg">{bus.operator}</h2>
      <p>{bus.from} → {bus.to}</p>
      <p>₹{bus.price}</p>

      <Link
        to={`/seats/${bus._id}`}
        className="block text-center bg-indigo-600 text-white mt-3 p-2 rounded"
      >
        Select Seat
      </Link>
    </div>
  );
}
