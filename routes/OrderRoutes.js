const express = require("express");
const router = express.Router();
const { getPendingOrders, fetchOrderHistory, fetchOrders,markorderrecived, fetchLocationWorkerOrders } = require("../controllers/OrderController");

router.post("/pending-orders", getPendingOrders);
router.get("/order-history", fetchOrderHistory);
router.get("/all-orders", fetchOrders);
router.post("/location-worker-orders", fetchLocationWorkerOrders);
router.patch("/markrecieved", markorderrecived);
module.exports = router;
