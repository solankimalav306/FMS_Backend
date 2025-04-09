const express = require("express");
const router = express.Router();
const { getPendingOrders, fetchOrderHistory, fetchOrders } = require("../controllers/OrderController");

router.post("/pending-orders", getPendingOrders);
router.get("/order-history", fetchOrderHistory);
router.get("/all-orders", fetchOrders);

module.exports = router;
