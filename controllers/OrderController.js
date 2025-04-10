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


const updateorder = async (req, res) => {
    const { orderID , collected } = req.body;

    try {
        const { data: orders, error: fetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("order_id", orderID)
            .single();

        if (fetchError || !orders) {
            return res.status(404).json({ error: "Order not found" });
        }
        const { error: updateError } = await supabase
            .from("orders")
            .update({ collected: collected })
            .eq("order_id", orderID);

        if (updateError) {
            return res.status(500).json({ error: "Failed to update order status" });
        }

        res.json({ message: "Order marked as collected successfully" });
    } catch (err) {
        console.error("Error processing order:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { getPendingOrders, fetchOrderHistory, fetchOrders, markorderrecived };
