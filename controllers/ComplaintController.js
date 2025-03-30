const supabase = require("../config/supabaseClient");

const fetchActiveComplaints = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: complaints, error } = await supabase
            .from("files")
            .select("complaint_id")
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


module.exports = { fetchActiveComplaints };
