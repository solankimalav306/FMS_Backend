const express = require("express");
const router = express.Router();
const { fetchPreviousBookings,fetchOntimeBookings, fetchActiveRequests, updatefeedback, newUserRequest, fetchBuildingDateRequests } = require("../controllers/RequestController");

router.post("/previous-bookings", fetchPreviousBookings);
router.post("/live-bookings",fetchOntimeBookings);
router.get("/active-requests", fetchActiveRequests);
router.patch("/updatefeedback", updatefeedback);
router.post("/new-user-request", newUserRequest);
router.post("/building-date-requests", fetchBuildingDateRequests);

module.exports = router;