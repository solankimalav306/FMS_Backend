const express = require("express");
const router = express.Router();
const { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted,createOrder,getLatestAssignedWorkers} = require("../controllers/WorkerController");

router.post("/login", loginWorker);
router.post("/work-queue", fetchWorkQueue);
router.get("/previous-orders", fetchPreviousOrders);
router.post("/mark-completed", markRequestCompleted);
router.post("/create-order", createOrder);

router.get("/latest-area-of-service", getLatestAssignedWorkers);

module.exports = router;
