const supabase = require("../config/supabaseClient");

const getPendingOrders = async (req, res) => {
    console.log("🔎 Checking session UserID:", req.session.userID); // Debugging

    if (!req.session.userID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", req.session.userID)
            .eq("collected", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getPendingOrders };
