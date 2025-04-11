const express = require("express");
const router = express.Router();
const { getAverageRequestsPerService,getTopRatedWorkersByRole } = require("../controllers/StatisticsController");

router.get("/avg-requests-per-service", getAverageRequestsPerService);
router.get("/top-rated-workers", getTopRatedWorkersByRole);
router.get('/services-by-date', getUserServiceRequestsByDate);

module.exports = router;
