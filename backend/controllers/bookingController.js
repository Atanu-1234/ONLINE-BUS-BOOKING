const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.user.id.toString() });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id.toString() }).sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBookedSeats = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { busId: req.params.busId, status: "confirmed" };
    if (date) query.journeyDate = date;
    const bookings = await Booking.find(query);
    res.json(bookings.flatMap((b) => b.seats));
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id.toString() });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const revenueData = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // bookings per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dailyData = await Booking.aggregate([
      { $match: { bookingDate: { $gte: sevenDaysAgo }, status: "confirmed" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalBookings, confirmedBookings, cancelledBookings, totalRevenue, dailyData });
  } catch (err) {
    res.status(500).json(err);
  }
};
