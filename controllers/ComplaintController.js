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
            .lt("complaints.complaint_datetime", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(5);

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

const addComplaint = async (req, res) => {
    try {
        const { user_id, complaint } = req.body;

        if (!user_id || !complaint) {
            return res.status(400).json({ error: "Missing user_id or complaint" });
        }

        // Step 1: Get a random admin_id
        const { data: admins, error: adminError } = await supabase
            .from("fms_admin")
            .select("admin_id");

        if (adminError || !admins || admins.length === 0) {
            return res.status(500).json({ error: "Failed to fetch admin" });
        }

        const randomIndex = Math.floor(Math.random() * admins.length);
        const admin_id = admins[randomIndex].admin_id;

        // Step 2: Get latest complaint_id and increment
        const { data: latestComplaint, error: idError } = await supabase
            .from("complaints")
            .select("complaint_id")
            .order("complaint_id", { ascending: false })
            .limit(1);

        if (idError) {
            return res.status(500).json({ error: "Failed to fetch latest complaint_id" });
        }

        const newComplaintId = latestComplaint.length > 0 ? latestComplaint[0].complaint_id + 1 : 1;

        // Step 3: Insert into complaints table (manual ID)
        const { error: insertComplaintError } = await supabase
            .from("complaints")
            .insert([{
                complaint_id: newComplaintId,
                complaint,
                complaint_datetime: new Date().toISOString()
            }]);

        if (insertComplaintError) {
            return res.status(500).json({ error: "Failed to insert complaint" });
        }

        // Step 4: Insert into files table
        const { error: fileError } = await supabase
            .from("files")
            .insert([{
                complaint_id: newComplaintId,
                user_id,
                admin_id,
                is_resolved: false
            }]);

        if (fileError) {
            return res.status(500).json({ error: "Failed to insert into files table" });
        }

        res.status(201).json({
            message: "Complaint added successfully",
            complaint_id: newComplaintId,
            admin_id
        });

    } catch (err) {
        console.error("Error adding complaint:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { fetchActiveComplaints, fetchDateComplaints, fetchUserComplaints, fetchLastDayComplaints, addComplaint };
