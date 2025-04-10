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
    const { WorkerID } = req.body;
    try {
        const { data: orders, error } = await supabase
            .from("")
            .select("order_id, location")
            .eq("worker_id", WorkerID)
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching orders" });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createOrder = async (req, res) => {
    const { worker_id, user_id, location } = req.body;

    if (!worker_id || !user_id || !location) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get the current highest order_id
        const { data: latest, error: fetchError } = await supabase
            .from("orders")
            .select("order_id")
            .order("order_id", { ascending: false })
            .limit(1);

        if (fetchError) {
            return res.status(500).json({ error: "Error fetching latest order_id" });
        }

        const newOrderId = (latest[0]?.order_id || 0) + 1;

        const { data, error } = await supabase
            .from("orders")
            .insert([
                {
                    order_id: newOrderId, // manually set
                    worker_id,
                    user_id,
                    location,
                    collected: false
                }
            ])
            .select("*");

        if (error) {
            return res.status(500).json({ error: "Error creating order", details: error.message });
        }

        res.status(201).json({ message: "Order created", order: data[0] });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getLatestAssignedWorkers = async (req, res) => {
    const limit = parseInt(req.query.limit) || null;

    try {
        // Step 1: Get latest assigned_time per worker
        const { data: latestAssigns, error: assignsError } = await supabase
            .from('assigns')
            .select('worker_id, assigned_time')
            .order('assigned_time', { ascending: false });

        if (assignsError) {
            return res.status(500).json({ error: "Error fetching assigns", details: assignsError.message });
        }

        // Group by latest assigned_time per worker
        const latestMap = {};
        for (const row of latestAssigns) {
            if (!latestMap[row.worker_id]) {
                latestMap[row.worker_id] = row.assigned_time;
            }
        }

        // Step 2: Fetch worker + assign info based on latestMap
        const assignments = Object.entries(latestMap)
            .map(([worker_id, assigned_time]) => ({ worker_id: parseInt(worker_id), assigned_time }));

        const queries = await Promise.all(assignments.slice(0, limit).map(async ({ worker_id, assigned_time }) => {
            const { data, error } = await supabase
                .from('assigns')
                .select('assigned_location, assigned_time, worker:worker_id(name)')
                .eq('worker_id', worker_id)
                .eq('assigned_time', assigned_time)
                .single();

            if (!error && data) {
                return {
                    worker_id,
                    name: data.worker.name,
                    assigned_location: data.assigned_location
                };
            }
        }));

        res.status(200).json({ workers: queries.filter(Boolean) });

    } catch (err) {
        console.error("Internal server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};




module.exports = { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted, createOrder, getLatestAssignedWorkers};
