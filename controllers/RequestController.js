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
            time: booking.request_time
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
            .select(`
                services:service_id (service_type),
                worker:worker_id (name)
            `)
            .eq("user_id", User_ID)
            .eq("is_completed", false);

        if (error) {
            return res.status(500).json({ error: "Error fetching bookings" });
        }

        // Optional: format output to only return clean names
        const formattedBookings = bookings.map(b => ({
            worker_name: b.worker?.name,
            service_name: b.services?.service_type
        }));

        res.json({ bookings: formattedBookings });
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

const newUserRequest = async (req, res) => {
    const { user_id, service, location } = req.body;
    const request_time = new Date().toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"

    if (!user_id || !service || !location) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const [room_no, building] = location.split(",").map(s => s.trim());

    try {
        // 1. Get service_id from service name
        const { data: serviceData, error: serviceError } = await supabase
            .from("services")
            .select("service_id")
            .eq("service_type", service)
            .single();

        if (serviceError || !serviceData) {
            return res.status(404).json({ error: "Service not found" });
        }

        const service_id = serviceData.service_id;

        // 2. Get all workers assigned to the same building and service
        const { data: assigns, error: assignError } = await supabase
            .from("assigns")
            .select("worker_id")
            .eq("assigned_location", building)
            .eq("service_id", service_id);

        if (assignError || !assigns || assigns.length === 0) {
            return res.status(404).json({ error: "No workers assigned to this service/building" });
        }

        // 3. Randomly pick one worker
        const randomWorker = assigns[Math.floor(Math.random() * assigns.length)].worker_id;

        // 4. Insert into requests
        const { data: insertData, error: insertError } = await supabase
            .from("requests")
            .insert([
                {
                    user_id,
                    service_id,
                    room_no,
                    building,
                    request_time,
                    worker_id: randomWorker,
                    is_completed: false,
                    feedback: null,
                    rating: null
                }
            ])
            .select();

        if (insertError) {
            return res.status(500).json({ error: "Failed to insert request", details: insertError });
        }

        res.status(201).json({ message: "Request created successfully", request: insertData[0] });

    } catch (err) {
        console.error("Error creating request:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// In your backend controller file (e.g., RequestController.js)

const fetchBuildingDateRequests = async (req, res) => {
    const { building, startTime, endTime } = req.body; // Assuming these are correct

    // Define the columns you want to select - INCLUDE location and service_type
    // ** Adjust 'service_type' if the column name in your 'requests' table is different **
    const columnsToSelect = `
         
                worker_id,
                user_id,
                service_id,
                room_no,
                building,
                request_time,
                feedback,
                services:service_id(service_type) 
    `;
    // ^^ If service_type is in a related 'services' table, adjust the select like this.
    // If service_type is directly in the 'requests' table, just use 'service_type' instead of 'services(...)'

    try {
        // It's much cleaner to build the query dynamically
        let query = supabase
            .from("requests")
            .select(columnsToSelect); // Select all needed columns

        // Apply filters conditionally
        if (building && building !== 'all') { // Check for 'all' if frontend might send it
            query = query.eq("building", building);
        }
        if (startTime) {
            query = query.gte("request_time", startTime);
        }
        if (endTime) {
            query = query.lte("request_time", endTime);
        }

        // Add filter to only get completed requests if this endpoint should only return history
        // query = query.eq("is_completed", true); // Or similar field

        // Execute the single query
        const { data, error } = await query;

        if (error) {
            console.error("Supabase error fetching filtered requests:", error);
            throw error; // Let the catch block handle it
        }

        console.log(`Filtered requests found: ${data ? data.length : 0}`);
        // --- Process data if needed (e.g., flatten related table data) ---
        const formatted = data.map(req => ({
            worker_id: req.worker_id,
            user_id: req.user_id,
            service_type: req.services?.service_type || "Unknown",
            location: `${req.room_no}, ${req.building}`,
            request_time: req.request_time,
            feedback: req.feedback || "N/A"
        }));
        // --- End processing ---


        // Send the processed data
        return res.json({ requests: processedData }); // Send the processed data array

    } catch (err) {
        console.error("Error fetching building/date requests:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
};

// Ensure this function is exported and used by the correct POST route
// module.exports = { ..., fetchBuildingDateRequests, ... };



module.exports = { fetchPreviousBookings, fetchOntimeBookings, fetchActiveRequests, updatefeedback, newUserRequest, fetchBuildingDateRequests };