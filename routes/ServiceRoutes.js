const express = require("express");
const router = express.Router();
const { fetchServices, num3 } = require("../controllers/ServiceController");

router.get("/", fetchServices);
router.get("/missing-services", num3);

module.exports = router;