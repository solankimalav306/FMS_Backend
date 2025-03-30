const express = require("express");
const router = express.Router();
const { fetchPreviousBookings,fetchOntimeBookings } = require("../controllers/RequestController");

router.get("/previous-bookings", fetchPreviousBookings);
router.get("/live-bookings",fetchOntimeBookings)

module.exports = router;