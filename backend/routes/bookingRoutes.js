const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createBooking, getBookings, getBookedSeats, cancelBooking, getAdminStats } = require("../controllers/bookingController");

router.post("/", auth, createBooking);
router.get("/", auth, getBookings);
router.get("/seats/:busId", getBookedSeats);
router.patch("/cancel/:id", auth, cancelBooking);
router.get("/admin/stats", auth, getAdminStats);

module.exports = router;
