const supabase = require("../config/supabaseClient");

const loginWorker = async (req, res) => {
    const { Worker_ID, WorkerPassword } = req.body;

    if (!Worker_ID || !WorkerPassword) {
        return res.status(400).json({ error: "Worker_ID and password are required" });
    }   
    
    try {
        const { data: worker, error } = await supabase
            .from("worker")
            .select("workerpassword, worker_id, assigned_role, assigns(assigned_location)")
            .eq("worker_id", Worker_ID)
            .single();

        if (error || !worker) {
            return res.status(401).json({ error: "Invalid Worker_ID or password" });
        }


        if (WorkerPassword !== worker.workerpassword) {
            return res.status(401).json({ error: "Invalid Worker_ID or password" });
        }
        
        req.session.WorkerID = worker.worker_id;
        req.session.workerRole = worker.assigned_role;
        req.session.workerAreaOfService = worker.assigned_location;
        console.log("✅ Session WorkerID Set:", req.session.Worker_ID);
        const { workerpassword, ...workerWithoutData } = worker;

        res.json({ message: "Login successful", worker: workerWithoutData });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchWorkQueue = async (req, res) => {

    try {
        const { data: queue, error } = await supabase
            .from("assigns")
            .select("assigned_location")
            .eq("worker_id", req.session.WorkerID)

        if (error) {
            return res.status(500).json({ error: "Error fetching queue" });
        }

        res.json({ queue });
    } catch (err) {
        console.error("Error fetching queue:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchPreviousOrders = async (req, res) => {

    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("order_id, location")
            .eq("worker_id", req.session.WorkerID)

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { loginWorker, fetchWorkQueue, fetchPreviousOrders };
