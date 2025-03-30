const supabase = require("../config/supabaseClient");

const fetchPreviousBookings = async (req, res) => {
    console.log("🔎 Checking session UserID:", req.session.userID);

    if (!req.session.userID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: bookings, error } = await supabase
            .from("requests")
            .select("*")
            .eq("user_id", req.session.userID)
            .eq("is_completed", true);

        if (error) {
            return res.status(500).json({ error: "Error fetching bookings" });
        }

        res.json({ bookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchOntimeBookings = async (req, res) => {
    console.log("🔎 Checking session UserID:", req.session.userID);

    if (!req.session.userID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: bookings, error } = await supabase
            .from("requests")
            .select("*")
            .eq("user_id", req.session.userID)
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching bookings" });
        }

        res.json({ bookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchActiveRequests = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: requests, error } = await supabase
            .from("requests")
            .select("*")
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching requests" });
        }

        res.json({ requests });
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchRequestsHistory = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: requests, error } = await supabase
            .from("requests")
            .select("*")
            .eq("is_completed", true);

        if (error) {
            return res.status(500).json({ error: "Error fetching requests" });
        }

        res.json({ requests });
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { fetchPreviousBookings, fetchOntimeBookings, fetchActiveRequests, fetchRequestsHistory };