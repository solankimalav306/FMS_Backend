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


const markorderrecived = async (req, res) => {
    const { orderID } = req.body;

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
            .update({ collected: true })
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

const fetchLocationWorkerOrders = async (req, res) => {
    const { worker_id, location } = req.body;

    try {
        if (!worker_id && !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Case 1: Both worker_id and location provided — fetch intersection
        if (worker_id && location) {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("worker_id", worker_id)
                .eq("location", location);

            if (error) throw error;

            return res.json({ orders: data });
        }

        // Case 2: Only worker_id provided
        if (worker_id) {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("worker_id", worker_id);

            if (error) throw error;

            return res.json({ orders: data });
        }

        // Case 3: Only location provided
        if (location) {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("location", location);

            if (error) throw error;

            return res.json({ orders: data });
        }

    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};




module.exports = { getPendingOrders, fetchOrderHistory, fetchOrders, markorderrecived, fetchLocationWorkerOrders };
