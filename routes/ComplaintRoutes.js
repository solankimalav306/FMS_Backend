const express = require("express");
const router = express.Router();
const { fetchActiveComplaints, fetchDateComplaints, fetchUserComplaints, fetchLastDayComplaints } = require("../controllers/ComplaintController");

router.get("/active-complaints", fetchActiveComplaints);
router.post("/date-complaints", fetchDateComplaints);
router.post("/user-complaints", fetchUserComplaints);
router.get("/last-day-complaints", fetchLastDayComplaints);

module.exports = router;