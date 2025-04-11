const express = require("express");
const router = express.Router();
const { fetchActiveComplaints, fetchDateComplaints, fetchUserComplaints } = require("../controllers/ComplaintController");

router.get("/active-complaints", fetchActiveComplaints);
router.post("/date-complaints", fetchDateComplaints);
router.post("/user-complaints", fetchUserComplaints);

module.exports = router;