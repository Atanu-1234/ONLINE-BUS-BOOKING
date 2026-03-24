const express = require("express");
const router = express.Router();
const Bus = require("../models/Bus");
const multer = require("multer");
const auth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ADD BUS (PROTECTED)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, from, to, price, totalSeats, date, startTime } = req.body;
    const bus = new Bus({
      name, from, to, price, totalSeats, date, startTime,
      image: req.file ? req.file.filename : "",
    });
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL BUSES with optional filters
router.get("/", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};
    if (from) query.from = new RegExp(from, "i");
    if (to) query.to = new RegExp(to, "i");

    if (date) {
      // return buses that match the exact date OR run everyday
      const routeQuery = from || to ? query : {};
      const buses = await Bus.find({
        ...routeQuery,
        $or: [{ date: date }, { date: "everyday" }],
      });
      return res.json(buses);
    }

    const buses = await Bus.find(query);
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET BOOKED SEAT COUNTS FOR MULTIPLE BUSES (batch availability)
router.get("/availability", async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const { busIds, date } = req.query;
    if (!busIds) return res.json({});
    const ids = busIds.split(",");
    const query = { busId: { $in: ids }, status: "confirmed" };
    if (date) query.journeyDate = date;
    const bookings = await Booking.find(query);
    const result = {};
    ids.forEach((id) => { result[id] = 0; });
    bookings.forEach((b) => { result[b.busId] = (result[b.busId] || 0) + b.seats.length; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE BUS
router.get("/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RATE A BUS (PROTECTED)
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    // remove previous rating by same user
    bus.ratings = bus.ratings.filter((r) => r.userId !== req.user.id.toString());
    bus.ratings.push({ userId: req.user.id.toString(), stars, comment });
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE BUS (PROTECTED)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndDelete(req.params.id);
    if (!deletedBus) return res.status(404).json({ message: "Bus not found" });
    res.json({ message: "Bus deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
