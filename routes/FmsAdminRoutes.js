const express = require("express");
const router = express.Router();
const { loginAdmin, fetchUsers, fetchEmployees } = require("../controllers/FmsAdminController");

router.post("/login", loginAdmin);
router.get("/view-users", fetchUsers);
router.get("/view-employees", fetchEmployees);

module.exports = router;
