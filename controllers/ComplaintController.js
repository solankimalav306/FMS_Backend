const supabase = require("../config/supabaseClient");

const fetchActiveComplaints = async (req, res) => {
    try {
        const { data: complaints, error } = await supabase
            .from("files")
            .select(`
                complaint_id,
                is_resolved,
                complaints (
                    complaint,
                    complaint_datetime
                )
            `)
            .eq("is_resolved", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching complaints", details: error });
        }

        const formatted = complaints.map(item => ({
            complaint_id: item.complaint_id,
            complaint: item.complaints?.complaint || "N/A",
            complaint_datetime: item.complaints?.complaint_datetime || null,
            is_resolved: item.is_resolved
        }));

        res.json({ complaints: formatted });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { fetchActiveComplaints };
