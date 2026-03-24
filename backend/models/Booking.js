const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: String,
  busId: String,
  busName: String,
  from: String,
  to: String,
  seats: [Number],
  totalAmount: Number,
  journeyDate: String,
  startTime: String,
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  cancelledAt: { type: Date },
});

module.exports = mongoose.model("Booking", bookingSchema);
