const express = require("express");
const router = express.Router();
const { getPendingOrders, fetchOrderHistory } = require("../controllers/OrderController");

router.post("/pending-orders", getPendingOrders);
router.get("/order-history", fetchOrderHistory);

module.exports = router;
