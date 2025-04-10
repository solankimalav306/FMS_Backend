const express = require("express");
const router = express.Router();
const { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted} = require("../controllers/WorkerController");

router.post("/login", loginWorker);
router.post("/work-queue", fetchWorkQueue);
router.get("/previous-orders", fetchPreviousOrders);
router.post("/mark-completed", markRequestCompleted);
module.exports = router;
