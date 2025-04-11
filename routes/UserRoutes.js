const express = require("express");
const router = express.Router();
const { loginUser, fetchDefaultAddress, num21, num19 } = require("../controllers/UsersController");

router.post("/login", loginUser);
router.post("/defaultAddress", fetchDefaultAddress);
router.get("/num21", num21);
router.get("/num19", num19);

module.exports = router;
