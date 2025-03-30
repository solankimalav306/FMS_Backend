const supabase = require("../config/supabaseClient");

const loginAdmin = async (req, res) => {
    const { Admin_ID, AdminPassword } = req.body;

    if (!Admin_ID || !AdminPassword) {
        return res.status(400).json({ error: "Admin_ID and password are required" });
    }   
    
    try {
        const { data: admin, error } = await supabase
            .from("fms_admin")
            .select("password, admin_id")
            .eq("admin_id", Admin_ID)
            .single();


        if (error || !admin) {
            return res.status(401).json({ error: "Invalid Admin_ID or password" });
        }


        if (AdminPassword !== admin.password) {
            return res.status(401).json({ error: "Invalid Admin_ID or password" });
        }
        
        req.session.AdminID = admin.admin_id;
        console.log("✅ Session WorkerID Set:", req.session.Worker_ID);
        const { password, ...adminWithoutData } = admin;

        res.json({ message: "Login successful", admin: adminWithoutData });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchUsers = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

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

module.exports = { loginAdmin, fetchUsers, fetchEmployees };
