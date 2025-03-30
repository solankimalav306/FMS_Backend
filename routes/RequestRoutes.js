const express = require("express");
const router = express.Router();
const { fetchPreviousBookings,fetchOntimeBookings, fetchActiveRequests, fetchRequestsHistory } = require("../controllers/RequestController");

router.get("/previous-bookings", fetchPreviousBookings);
router.get("/live-bookings",fetchOntimeBookings);
router.get("/active-requests", fetchActiveRequests);
router.get("/requests-history", fetchRequestsHistory);

module.exports = router;