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

        // ✅ Only return the last assigned_location (if exists)
        const latestAssignedLocation = Array.isArray(worker.assigns) && worker.assigns.length > 0
            ? worker.assigns[worker.assigns.length - 1].assigned_location
            : null;

        res.json({
            worker_id: worker.worker_id,
            role: worker.assigned_role,
            assigned_location: latestAssignedLocation
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchWorkQueue = async (req, res) => {
    const { WorkerID } = req.body;

    if (!WorkerID) {
        return res.status(400).json({ error: "WorkerID is required" });
    }

    try {
        const { data: requests, error } = await supabase
            .from("requests")
            .select("building, room_no, request_time")
            .eq("worker_id", WorkerID)
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching work queue", details: error });
        }

        // Format each entry as "room_no,building"
        const formattedQueue = requests.map(req => `${req.room_no},${req.building},${req.request_time}`);

        res.json({ queue: formattedQueue });
    } catch (err) {
        console.error("Error fetching work queue:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const markRequestCompleted = async (req, res) => {
    const { worker_id, building, room_no, request_time } = req.body;

    if (!worker_id || !building || !room_no || !request_time) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { error } = await supabase
            .from("requests")
            .update({ is_completed: true })
            .match({
                worker_id: worker_id,
                building: building,
                room_no: room_no,
                request_time: request_time
            });

        if (error) {
            return res.status(500).json({ error: "Failed to update request", details: error });
        }

        res.json({ success: true, message: "Request marked as completed." });
    } catch (err) {
        console.error("Error updating request:", err);
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


module.exports = { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted};
