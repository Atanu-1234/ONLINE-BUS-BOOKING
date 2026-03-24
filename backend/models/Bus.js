const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  stops: [String],
  price: Number,
  totalSeats: Number,
  image: String,
  date: String,
  startTime: String,
  ratings: [{ userId: String, stars: Number, comment: String, date: { type: Date, default: Date.now } }],
});

module.exports = mongoose.model("Bus", busSchema);
