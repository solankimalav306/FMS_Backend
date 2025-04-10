const express = require("express");
const router = express.Router();
const { loginUser, fetchDefaultAddress } = require("../controllers/UsersController");

router.post("/login", loginUser);
router.post("/defaultAddress", fetchDefaultAddress);

module.exports = router;
