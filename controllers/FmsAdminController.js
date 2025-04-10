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

    console.log("hi");

    try {
        console.log("please kill me");
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

const fetchActiveComplaints = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: complaints, error } = await supabase
            .from("files")
            .select("*")
            .eq("is_resolved", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching complaints" });
        }

        res.json({ complaints });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchRequestHistory = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: requests, error } = await supabase
            .from("requests")
            .select("*")
            .or("is_completed.eq.true,is_cancelled.eq.true");

        if (error) {
            return res.status(500).json({ error: "Error fetching requests" });
        }

        res.json({ requests });
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const assignService = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { worker_id, assigned_location } = req.body;

    if (!worker_id || !assigned_location) {
        return res.status(400).json({ error: "Worker id and assigned location is required" });
    }

    try {
        const { data: workerData, error: workerError } = await supabase
            .from('worker')
            .select('assigned_service')
            .eq('worker_id', worker_id)
            .single();

        if (workerError || !workerData) {
            return res.status(500).json({ error: "Error fetching worker's assigned service" });
        }

        const assignedService = workerData.assigned_service;

        const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('service_id')
            .eq('service_type', assignedService)
            .single();

        if (serviceError || !serviceData) {
            return res.status(500).json({ error: "Error fetching service_id" });
        }

        const service_id = serviceData.service_id;
        const admin_id = req.session.AdminID;
        const assigned_time = new Date().toISOString();

        const { data: insertData, error: insertError } = await supabase
            .from('assigns')
            .insert([
                {
                    service_id,
                    admin_id,
                    worker_id,
                    assigned_time,
                    assigned_location
                }
            ])
            .select();

        if (insertError) {
            console.error("Error inserting into assigns:", insertError);
            return res.status(500).json({ error: "Error assigning service" });
        }

        res.json({
            message: "Service assigned successfully",
            insertedData: insertData
        });
    } catch (err) {
        console.error("Error assigning service:", err);
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

const updateUserData = async (req, res) => {
    process.stdout.write("!!! DEBUG: FUNCTION CALLED !!!\n");
    // --- Debug: Log route entry and received body ---
    console.log('--- PUT /admin/update-user-location (or appropriate path) ---'); // Adjust path if needed
    console.log('Received request body:', JSON.stringify(req.body, null, 2)); // Log the full body prettified

    try {
        // --- Extract data from body ---
        const { user_id, username, building, roomno, email } = req.body;
        console.log('Extracted Data:', { user_id, username, building, roomno }); // Log the destructured variables

        // --- Basic Validation ---
        // Optional: Add more specific checks (e.g., typeof building === 'string') if needed
        if (!user_id) { // Only user_id might be strictly necessary to identify the user
            console.error('Validation Error: user_id is missing.');
            return res.status(400).json({ error: "user_id is required to update user data" });
        }
        // Depending on your logic, you might allow partial updates,
        // so checking for !username, !building, !roomno might be too strict here
        // unless they are *always* required for an update.

        // --- Prepare update object (only include fields that are actually present) ---
        // This prevents accidentally setting fields to 'undefined' in the database
        // if they weren't sent by the frontend.
        const updateObject = {};
        if (username !== undefined) updateObject.username = username;
        if (building !== undefined) updateObject.building = building; // MAKE SURE 'building' IS THE CORRECT DB COLUMN NAME
        if (roomno !== undefined) updateObject.roomno = roomno;
        updateObject.email = email;    // MAKE SURE 'roomno' IS THE CORRECT DB COLUMN NAME

        console.log(`Prepared update object for user ${user_id}:`, updateObject);

        // Check if there's anything to update
        if (Object.keys(updateObject).length === 0) {
            console.warn(`No fields provided to update for user_id: ${user_id}`);
            // Decide how to handle this - maybe success with no change, or a bad request?
            return res.status(400).json({ error: "No update data provided" });
            // Or: return res.json({ message: "No changes applied", user: null });
        }


        // --- Database Interaction ---
        console.log(`Attempting Supabase update for user_id: ${user_id}`);
        const { data, error } = await supabase
            .from("users") // Ensure 'users' is the correct table name
            .update(updateObject) // Use the object with defined fields
            .eq("user_id", user_id) // Ensure 'user_id' is the correct primary key column
            .select(); // select() returns the updated rows

        // --- Debug: Log Supabase Response ---
        console.log('Supabase update response:', { data: JSON.stringify(data, null, 2), error: error });

        // --- Handle Supabase Errors ---
        if (error) {
            console.error('Supabase Error during update:', error);
            // Use 500 for database errors, unless it's a specific constraint violation etc.
            return res.status(500).json({ error: "Error updating user details in database", details: error.message });
        }

        // --- Handle User Not Found or No Update ---
        // If .eq() finds no match, Supabase update usually returns data: [] and error: null
        if (!data || data.length === 0) {
            console.warn(`User not found or no update needed for user_id: ${user_id}. Supabase returned empty data.`);
            // 404 is appropriate if the user specified by user_id doesn't exist
            return res.status(404).json({ error: "User not found with the provided user_id" });
        }

        // --- Success ---
        console.log(`Successfully updated user ${user_id}. Data:`, JSON.stringify(data[0], null, 2));
        res.json({ message: "User details updated successfully", user: data[0] }); // Return the first updated user object

    } catch (err) {
        // --- Catch unexpected errors (e.g., programming errors in the try block) ---
        console.error("Unexpected error in updateUserData handler:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateWorkerData = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { worker_id, name, phone_no, assigned_service, date_of_joining } = req.body;

        if (!worker_id || !name || !assigned_service || !date_of_joining) {
            return res.status(400).json({ error: "worker_id, name, assigned_service and date of joining are required" });
        }

        const { data, error } = await supabase
            .from("worker")
            .update({ name, phone_no, assigned_service, date_of_joining })
            .eq("worker_id", worker_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating worker details" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Worker not found" });
        }

        res.json({ message: "Worker details updated successfully", worker: data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateOrderStatus = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { order_id, collected } = req.body;

        if (!order_id || !collected) {
            return res.status(400).json({ error: "order_id and collected status are required" });
        }

        const { data, error } = await supabase
            .from("orders")
            .update({ collected })
            .eq("order_id", order_id)
            .select();

        if (error) {
            return res.status(401).json({ error: "Error updating order details" });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order details updated successfully", worker: data });
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

const fetchActiveRequests = async (req, res) => {
    try {
        const { data: requests, error } = await supabase
            .from("requests")
            .select(`
                user_id,
                worker_id,
                service_id,
                building,
                room_no,
                feedback,
                is_completed,
                request_time,
                services (
                    service_type
                )
            `)
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching active requests", details: error });
        }

        const formatted = requests.map(r => ({
            user_id: r.User_ID,
            worker_id: r.Worker_ID,
            service: r.services?.service_type || "Unknown",
            building: r.building,
            room_no: r.room_no,
            time: r.request_time,
            status: r.is_completed ? "completed" : "pending"
        }));

        res.json({ requests: formatted });
    } catch (err) {
        console.error("Error fetching active requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { fetchActiveRequests, loginAdmin, fetchUsers, fetchEmployees, fetchActiveComplaints, fetchRequestHistory, assignService, addService, addWorker, addUser, addAdmin, removeWorker, removeUser, removeService, updateUserData, updateWorkerData, updateOrderStatus, resolveComplaint, completeRequest };
