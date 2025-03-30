const express = require("express");
const router = express.Router();
const { fetchServices } = require("../controllers/ServiceController");

router.get("/", fetchServices);

module.exports = router;