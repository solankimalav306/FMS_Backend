const express = require("express");
const router = express.Router();
const { getPendingOrders } = require("../controllers/OrderController");

router.get("/pending-orders", getPendingOrders);

module.exports = router;
