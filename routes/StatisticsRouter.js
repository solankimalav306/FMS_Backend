const express = require("express");
const router = express.Router();
const { getAverageRequestsPerService } = require("../controllers/StatisticsController");

router.get("/avg-requests-per-service", getAverageRequestsPerService);

module.exports = router;
