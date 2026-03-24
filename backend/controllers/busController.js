const Bus = require("../models/Bus");

// GET ALL + SEARCH
exports.getBuses = async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = {};

    if (from && to) {
      query.from = new RegExp(from, "i");
      query.to = new RegExp(to, "i");
    }

    const buses = await Bus.find(query);
    res.json(buses);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET SINGLE BUS
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    res.json(bus);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD BUS
exports.addBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json(err);
  }
};


// ✅ DELETE BUS
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({ message: "Bus deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};