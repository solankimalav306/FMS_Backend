const supabase = require("../config/supabaseClient");

const fetchServices = async (req, res) => {
    try {
        const { data: services, error } = await supabase
            .from("services")
            .select("service_type");
        if (error || !services) {
            return res.status(401).json({ error: "Error fetching services." });
        }
        res.json({ message: "Services Fetched", services: services });
    }catch (err) {
        console.error("Data fetch error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const num3 = async (req, res) => {
    try {
        const { data: services, error } = await supabase.rpc('get_missing_services_by_building', {
            building_input: 'R&D block'
        });

        if (error || !services) {
            return res.status(401).json({ error: "Error fetching services." });
        }
        res.json({ services });
    } catch (err) {
        console.error("Data fetch error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { fetchServices, num3 };