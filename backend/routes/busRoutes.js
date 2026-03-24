const express = require("express");
const router = express.Router();
const Bus = require("../models/Bus");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// ADD BUS (PROTECTED)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, from, to, stops, price, totalSeats, date, startTime } = req.body;
    const stopsArr = stops ? (Array.isArray(stops) ? stops : JSON.parse(stops)) : [from, to];
    const bus = new Bus({
      name, from: stopsArr[0], to: stopsArr[stopsArr.length - 1],
      stops: stopsArr, price, totalSeats, date, startTime,
      image: req.file ? req.file.path : "",
    });
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL UNIQUE CITIES
router.get("/cities", async (req, res) => {
  try {
    const buses = await Bus.find({}, "stops from to");
    const citySet = new Set();
    buses.forEach((b) => {
      if (b.stops && b.stops.length) b.stops.forEach((s) => citySet.add(s.trim()));
      else { if (b.from) citySet.add(b.from.trim()); if (b.to) citySet.add(b.to.trim()); }
    });
    res.json([...citySet].sort());
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

// GET ALL BUSES with optional filters
router.get("/", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let buses = await Bus.find();

    if (from && to) {
      buses = buses.filter((b) => {
        const stops = b.stops && b.stops.length ? b.stops : [b.from, b.to];
        const fi = stops.findIndex((s) => s.toLowerCase() === from.toLowerCase());
        const ti = stops.findIndex((s) => s.toLowerCase() === to.toLowerCase());
        return fi !== -1 && ti !== -1 && fi < ti;
      });
    }

    if (date) {
      buses = buses.filter((b) => b.date === date || b.date === "everyday");
    }

    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
