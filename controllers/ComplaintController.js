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

const fetchDateComplaints = async (req, res) => {
    const { date } = req.body; 

    try {
        if (!date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59.999`;

        const { data, error } = await supabase
            .from("complaints")
            .select("*")
            .gte("complaint_datetime", startOfDay)
            .lte("complaint_datetime", endOfDay);

        if (error) {
            return res.status(500).json({ error: "Error fetching complaints" });
        }

        res.json({ complaints: data });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchUserComplaints = async (req, res) => {
    const { user_id } = req.body; 

    try {
        if (!user_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from('files')
            .select(`
                complaint_id,
                is_resolved,
                complaints (
                    complaint,
                    complaint_datetime
                )
            `)
            .eq('user_id', user_id);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Error fetching complaints" });
        }

        res.json({ complaints: data });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchLastDayComplaints = async (req, res) => {
    try {
        const { data, error } = await supabase
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
            .lt("complaints.complaint_datetime", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Error fetching complaints" });
        }

        res.json({ complaints: data });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { fetchActiveComplaints, fetchDateComplaints, fetchUserComplaints, fetchLastDayComplaints };
