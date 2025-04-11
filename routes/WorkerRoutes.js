const express = require("express");
const router = express.Router();
const { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted,createOrder,getLatestAssignedWorkers,addWorkerAssignment, fetchCompletedRequests, fetchLocationGuards } = require("../controllers/WorkerController");

router.post("/login", loginWorker);
router.post("/work-queue", fetchWorkQueue);
router.get("/previous-orders", fetchPreviousOrders);
router.post("/mark-completed", markRequestCompleted);
router.post("/create-order", createOrder);
router.post("/completed-requests", fetchCompletedRequests);
router.post("/location-guards", fetchLocationGuards);
router.get("/latest-area-of-service", getLatestAssignedWorkers);
router.post("/new-assign",addWorkerAssignment)

module.exports = router;
