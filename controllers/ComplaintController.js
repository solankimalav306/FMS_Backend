const supabase = require("../config/supabaseClient");

const fetchActiveComplaints = async (req, res) => {
    const limit = parseInt(req.query.limit) || null;

    try {
        let query = supabase
            .from("files")
            .select(`
                complaint_id,
                is_resolved,
                complaints (
                    complaint,
                    complaint_datetime
                )
            `)
            .eq("is_resolved", false)
            .order("complaint_id", { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: "Error fetching complaints" });
        }

        // Format flattened result
        const complaints = data.map(c => ({
            complaint_id: c.complaint_id,
            is_resolved: c.is_resolved,
            complaint: c.complaints?.complaint,
            complaint_datetime: c.complaints?.complaint_datetime
        }));

        res.json({ complaints });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};




module.exports = { fetchActiveComplaints };
