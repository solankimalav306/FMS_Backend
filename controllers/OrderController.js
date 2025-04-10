const supabase = require("../config/supabaseClient");

const getPendingOrders = async (req, res) => {
    const { User_ID } = req.body;

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("order_id, location, worker (name)")
            .eq("user_id", User_ID)
            .eq("collected", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        const formattedOrders = orders.map((order) => ({
            order_id: order.order_id,
            receiver: order.worker?.name || "Unknown",
            location: order.location
        }));

        res.json({ orders: formattedOrders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchOrderHistory = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("collected", true);

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchOrders = async (req, res) => {
    console.log("🔎 Checking session AdminID:", req.session.AdminID);

    if (!req.session.AdminID) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const markorderrecived = async (req, res) => {
    const { orderID } = req.body;
    try {

        const { data: orders, error } = await supabase
            .from("orders")
            .eq('order_id',orderID)
            .select("*")

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getPendingOrders, fetchOrderHistory, fetchOrders };
