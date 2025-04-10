const supabase = require("../config/supabaseClient");

const loginAdmin = async (req, res) => {
    const { Admin_ID, AdminPassword } = req.body;

    if (!Admin_ID || !AdminPassword) {
        return res.status(400).json({ status: "FAIL", message: "Admin ID and password are required" });
    }

    try {
        const { data: admin, error } = await supabase
            .from("fms_admin")
            .select("password, admin_id")
            .eq("admin_id", Admin_ID)
            .single();

        if (error || !admin) {
            return res.status(401).json({ status: "FAIL", message: "Invalid Admin ID" });
        }

        if (AdminPassword !== admin.password) {
            return res.status(401).json({ status: "FAIL", message: "Invalid password" });
        }

        req.session.AdminID = admin.admin_id;
        console.log("✅ Session AdminID Set:", req.session.AdminID);
        const { password, ...adminWithoutData } = admin;

        return res.json({ status: "PASS", message: "Login successful", admin: adminWithoutData });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ status: "FAIL", message: "Internal server error" });
    }
};

const fetchUsers = async (req, res) => {

    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("*")

        if (error) {
            return res.status(500).json({ error: "Error fetching users" });
        }

        res.json({ users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchEmployees = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: employees, error } = await supabase
            .from("worker")
            .select("*")

        if (error) {
            return res.status(500).json({ error: "Error fetching employees" });
        }

        res.json({ employees });
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addService = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { service_id, service_type } = req.body;

    if (!service_id || !service_type) {
        return res.status(400).json({ error: "Service id and service type is required" });
    }

    try {
        const { data, error } = await supabase
            .from("services")
            .insert([
                {
                    service_id,
                    service_type
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({ error: "Error adding service" });
        }

        res.json({ message: "Service added successfully", service: data });
    } catch (err) {
        console.error("Error adding service:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addWorker = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { worker_id, name, phone_no, assigned_role, date_of_joining, workerpassword, rating } = req.body;


        if (!worker_id || !name || !phone_no || !assigned_role || !date_of_joining || !workerpassword) {
            return res.status(400).json({ error: "All fields except rating are required" });
        }

        const { data, error } = await supabase
            .from("worker")
            .insert([
                {
                    worker_id,
                    name,
                    phone_no,
                    assigned_role,
                    date_of_joining,
                    rating: rating || null,
                    workerpassword
                }
            ])
            .select();

        if (error) {
            return res.status(401).json({ error: "Error adding worker" });
        }

        res.json({ message: "Worker added successfully", worker: data });
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addUser = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { user_id, username, email, building, roomno, userpassword } = req.body;

        if (!user_id || !username || !email || !userpassword) {
            return res.status(400).json({ error: "user_id, username, email, and userpassword are required" });
        }

        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    user_id,
                    username,
                    email,
                    building: building || null,
                    roomno: roomno || null,
                    userpassword
                }
            ])
            .select();

        if (error) {
            return res.status(401).json({ error: "Error adding user" });
        }

        res.json({ message: "User added successfully", user: data });
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addAdmin = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { admin_id, password } = req.body;

        if (!admin_id || !password) {
            return res.status(400).json({ error: "admin_id and password are required" });
        }

        const { data, error } = await supabase
            .from("fms_admin")
            .insert([
                {
                    admin_id,
                    password
                }
            ])
            .select();

        if (error) {
            return res.status(401).json({ error: "Error adding admin" });
        }

        res.json({ message: "Admin added successfully", admin: data });
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const removeWorker = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { worker_id } = req.body;

        if (!worker_id) {
            return res.status(400).json({ error: "worker_id is required" });
        }

        const { data, error } = await supabase
            .from("worker")
            .delete()
            .eq("worker_id", worker_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error deleting worker" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Worker not found" });
        }

        res.json({ message: "Worker removed successfully", worker: data });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const removeUser = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }

        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("user_id", user_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error deleting user" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User removed successfully", user: data });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const removeService = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { service_type } = req.body;

        if (!service_type) {
            return res.status(400).json({ error: "Service type is required" });
        }

        const { data, error } = await supabase
            .from("services")
            .delete()
            .eq("service_type", service_type)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error deleting service" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json({ message: "Service removed successfully", service: data });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateUserLocation = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { user_id, building, roomno } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }

        if (building === undefined && roomno === undefined) {
            return res.status(400).json({ error: "At least one of building or roomno must be provided" });
        }

        const { data, error } = await supabase
            .from("users")
            .update({ building, roomno })
            .eq("user_id", user_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating user details" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User details updated successfully", user: data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateWorkerRole = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { worker_id, assigned_role } = req.body;

        if (!worker_id || !assigned_role) {
            return res.status(400).json({ error: "worker_id and assigned_role are required" });
        }

        const { data, error } = await supabase
            .from("worker")
            .update({ assigned_role })
            .eq("worker_id", worker_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating worker role" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Worker not found" });
        }

        res.json({ message: "Worker role updated successfully", worker: data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resolveComplaint = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { complaint_id } = req.body;

        if (!complaint_id) {
            return res.status(400).json({ error: "complaint_id is required" });
        }

        const { data, error } = await supabase
            .from("files")
            .update({ is_resolved: true })
            .eq("complaint_id", complaint_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating complaint status" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        res.json({ message: "Complaint resolved successfully", complaint: data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const completeRequest = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { request_id } = req.body;

        if (!request_id) {
            return res.status(400).json({ error: "request_id is required" });
        }

        const { data, error } = await supabase
            .from("requests")
            .update({ is_completed: true })
            .eq("request_id", request_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating request status" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Request not found" });
        }

        res.json({ message: "Request marked as completed successfully", request: data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { loginAdmin, fetchUsers, fetchEmployees, addService, addWorker, addUser, addAdmin, removeWorker, removeUser, removeService, updateUserLocation, updateWorkerRole, resolveComplaint, completeRequest };
