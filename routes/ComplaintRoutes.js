const express = require("express");
const router = express.Router();
const { fetchActiveComplaints } = require("../controllers/ComplaintController");

router.get("/active-complaints", fetchActiveComplaints);

module.exports = router;