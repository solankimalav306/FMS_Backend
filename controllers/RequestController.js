const supabase = require("../config/supabaseClient");

// const fetchPreviousBookings = async (req, res) => {
//     const { User_ID } = req.body;
//     try {
//         const { data: bookings, error } = await supabase
//             .from("requests")
//             .select("*")
//             .eq("user_id", User_ID)
//             .eq("is_completed", true);

//         if (error) {
//             return res.status(500).json({ error: "Error fetching bookings" });
//         }

//         res.json({ bookings });
//     } catch (err) {
//         console.error("Error fetching bookings:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

const fetchPreviousBookings = async (req, res) => {
    const { User_ID } = req.body;
    try {
        const { data: bookings, error } = await supabase
            .from("requests")
            .select(`
                is_completed,
                feedback,
                Worker(Name),
                Services(Service_Type)
            `)
            .eq("User_ID", User_ID)
            .eq("is_completed", true);

        if (error) {
            return res.status(500).json({ error: "Error fetching bookings" });
        }

        // Formatting the response
        const formattedBookings = bookings.map(booking => ({
            service: booking.Services?.Service_Type || "Unknown",
            name: booking.Worker?.Name || "Unknown",
            is_completed: booking.is_completed,
            feedback: booking.feedback || "NULL"
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

module.exports = { fetchPreviousBookings, fetchOntimeBookings, fetchActiveRequests, fetchRequestsHistory };