const express = require("express");
const router = express.Router();
const { getPendingOrders, fetchOrderHistory } = require("../controllers/OrderController");

router.get("/pending-orders", getPendingOrders);
router.get("/order-history", fetchOrderHistory);

module.exports = router;
