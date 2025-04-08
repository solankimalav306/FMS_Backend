const supabase = require("../config/supabaseClient");

const fetchActiveComplaints = async (req, res) => {
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
