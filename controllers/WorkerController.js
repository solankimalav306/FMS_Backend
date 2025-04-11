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
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        // Step 1: Fetch all workers ordered by worker_id
        const { data: workers, error: workerError } = await supabase
            .from("worker")
            .select("worker_id, name")
            .order("worker_id", { ascending: true });

        if (workerError) {
            return res.status(500).json({ error: "Error fetching workers", details: workerError.message });
        }

        // Step 2: For each worker, get their latest assigned_location
        const workerResults = await Promise.all(workers.map(async (worker) => {
            const { data: latestAssign, error: assignError } = await supabase
                .from("assigns")
                .select("assigned_location")
                .eq("worker_id", worker.worker_id)
                .order("assigned_time", { ascending: false })
                .limit(1)
                .maybeSingle(); // gracefully handles null

            return {
                worker_id: worker.worker_id,
                name: worker.name,
                assigned_location: latestAssign?.assigned_location || null
            };
        }));

        // Step 3: Apply optional limit and respond
        const sliced = limit ? workerResults.slice(0, limit) : workerResults;
        res.status(200).json({ workers: sliced });

    } catch (err) {
        console.error("Internal server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addWorkerAssignment = async (req, res) => {
    const { worker_id, assigned_location } = req.body;

    if (!worker_id || !assigned_location) {
        return res.status(400).json({ error: "worker_id and assigned_location are required" });
    }

    try {
        // Step 1: Get the worker's role
        const { data: workerData, error: workerError } = await supabase
            .from("worker")
            .select("assigned_role")
            .eq("worker_id", worker_id)
            .single();

        if (workerError || !workerData) {
            return res.status(404).json({ error: "Worker not found" });
        }

        const role = workerData.assigned_role;

        // Step 2: Determine service_id based on role
        const roleToServiceId = {
            "Guard": 1,
            "Cleaner": 2,
            "Painter": 3,
            "Carpenter": 4,
            "Electrician": 5,
            "Miscellaneous": 6
        };

        const service_id = roleToServiceId[role];

        if (!service_id) {
            return res.status(400).json({ error: `No service_id mapping for role: ${role}` });
        }

        // Step 3: Insert into assigns table
        const { error: insertError } = await supabase
            .from("assigns")
            .insert([
                {
                    service_id,
                    admin_id: 1,
                    worker_id,
                    assigned_time: new Date().toISOString(),
                    assigned_location
                }
            ]);

        if (insertError) {
            return res.status(500).json({ error: "Failed to insert assignment", details: insertError.message });
        }

        res.status(200).json({ message: "Worker assignment added successfully." });

    } catch (err) {
        console.error("Error adding worker assignment:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchCompletedRequests = async (req, res) => {
    const { worker_id } = req.body;

    try {
        if (!worker_id) {
            return res.status(400).json({ error: "worker_id is required" });
        }

        const { data, error } = await supabase
            .from('requests')
            .select(`
                building,
                room_no,
                request_time,
                feedback,
                services (
                    service_type
                )
            `)
            .eq('worker_id', worker_id)
            .eq('is_completed', true);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Error fetching completed requests" });
        }

        res.json({ requests: data });
    } catch (err) {
        console.error("Error fetching completed requests:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchLocationGuards = async (req, res) => {
    const { location } = req.body;

    try {
        if (!location) {
            return res.status(400).json({ error: "location is required" });
        }

        const { data, error } = await supabase
            .from('orders')
            .select('worker_id, worker(name)')
            .eq('collected', true)
            .eq('location', location);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "Error fetching workers" });
        }

        res.json({ data });
    } catch (err) {
        console.error("Error fetching workers:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { loginWorker, fetchWorkQueue, fetchPreviousOrders ,markRequestCompleted, createOrder, getLatestAssignedWorkers,addWorkerAssignment, fetchCompletedRequests, fetchLocationGuards };
