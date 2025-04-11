const express = require("express");
const router = express.Router();
const { fetchCompletedRequests, fetchActiveRequests, loginAdmin, fetchUsers, fetchEmployees, fetchActiveComplaints, fetchRequestHistory, assignService, addService, addWorker, addUser, addAdmin, removeWorker, removeUser, removeService, updateUserData, updateWorkerData, updateOrderStatus, resolveComplaint, completeRequest } = require("../controllers/FmsAdminController");

router.post("/login", loginAdmin);
router.get("/view-users", fetchUsers);
router.get("/view-employees", fetchEmployees);
router.get("/active-complaints", fetchActiveComplaints);
router.get("/request-history", fetchRequestHistory);
router.post("/assign-service", assignService);
router.post("/add-service", addService);
router.post("/add-worker", addWorker);
router.post("/add-user", addUser);
router.post("/add-admin", addAdmin);
router.delete("/remove-worker", removeWorker);
router.delete("/remove-user", removeUser);
router.delete("/remove-service", removeService);
router.patch("/update-user-data", updateUserData);
router.put("/update-worker-role", updateWorkerData);
router.put("/update-order-status", updateOrderStatus);
router.put("/resolve-complaint", resolveComplaint);
router.put("/complete-request", completeRequest);
router.get("/active-requests", fetchActiveRequests);
router.get("/completed-requests", fetchCompletedRequests);

module.exports = router;
