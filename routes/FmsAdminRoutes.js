const express = require("express");
const router = express.Router();
const { loginAdmin, fetchUsers, fetchEmployees, addService, addWorker, addUser, addAdmin, removeWorker, removeUser, removeService, updateUserLocation, updateWorkerRole, resolveComplaint, completeRequest } = require("../controllers/FmsAdminController");

router.post("/login", loginAdmin);
router.get("/view-users", fetchUsers);
router.get("/view-employees", fetchEmployees);
router.post("/add-service", addService);
router.post("/add-worker", addWorker);
router.post("/add-user", addUser);
router.post("/add-admin", addAdmin);
router.delete("/remove-worker", removeWorker);
router.delete("/remove-user", removeUser);
router.delete("/remove-service", removeService);
router.put("/update-user-location", updateUserLocation);
router.put("/update-worker-role", updateWorkerRole);
router.put("/resolve-complaint", resolveComplaint);
router.put("/complete-request", completeRequest);


module.exports = router;
