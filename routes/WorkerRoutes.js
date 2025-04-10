const express = require("express");
const router = express.Router();
const { loginWorker, fetchWorkQueue, fetchPreviousOrders } = require("../controllers/WorkerController");

router.post("/login", loginWorker);
router.post("/work-queue", fetchWorkQueue);
router.get("/previous-orders", fetchPreviousOrders);

module.exports = router;
