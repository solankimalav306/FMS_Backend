const express = require("express");
const router = express.Router();
const { fetchPreviousBookings,fetchOntimeBookings, fetchActiveRequests, fetchRequestsHistory, updatefeedback, newUserRequest } = require("../controllers/RequestController");

router.post("/previous-bookings", fetchPreviousBookings);
router.post("/live-bookings",fetchOntimeBookings);
router.get("/active-requests", fetchActiveRequests);
router.get("/requests-history", fetchRequestsHistory);
router.patch("/updatefeedback", updatefeedback);
router.post("/new-user-request", newUserRequest);

module.exports = router;