const supabase = require("../config/supabaseClient");

const fetchPreviousBookings = async (req, res) => {
    const { User_ID } = req.body;
    try {
        const { data: bookings, error } = await supabase
            .from("requests")
            .select(`
                is_completed,
                feedback,
                rating,
                worker!inner(name),
                services!inner(service_type),
                request_time
            `)
            .eq("user_id", User_ID)
            .eq("is_completed", true);

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: "Error fetching bookings" });
        }

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ error: "No bookings found" });
        }

        const formattedBookings = bookings.map(booking => ({
            service: booking.services?.service_type || "Unknown",
            name: booking.worker?.name || "Unknown",
            is_completed: booking.is_completed,
            feedback: booking.feedback || "NULL",
            rating: booking.rating || "NULL",
            time:booking.request_time
        }));

        res.json({ bookings: formattedBookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchOntimeBookings = async (req, res) => {
    const { User_ID } = req.body;

    try {
        const { data: bookings, error } = await supabase
            .from("requests")
            .select("*")
            .eq("user_id", User_ID)
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

const updatefeedback = async (req, res) => {
    const { User_ID, request_time, feedback, rating } = req.body;

    if (!User_ID || !request_time || !feedback || rating === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { data, error } = await supabase
            .from("requests")
            .update({ feedback, rating })
            .eq("user_id", User_ID)
            .eq("request_time", request_time)
            .select();

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Error updating feedback" });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No matching request found" });
        }

        res.json({ message: "Feedback updated successfully", updatedRequest: data[0] });
    } catch (err) {
        console.error("Error updating feedback:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { fetchPreviousBookings, fetchOntimeBookings, fetchActiveRequests, fetchRequestsHistory, updatefeedback };