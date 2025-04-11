const supabase = require("../config/supabaseClient");

const getAverageRequestsPerService = async (req, res) => {
    try {
      // Step 1: Fetch all request records with date extracted
      const { data: requests, error: reqError } = await supabase
        .from('requests')
        .select('service_id, user_id, request_time');
  
      if (reqError) {
        return res.status(500).json({ error: 'Error fetching requests', details: reqError.message });
      }
  
      // Step 2: Create a Map of service_id → date → unique user count
      const countMap = new Map();
//   lol
      requests.forEach(({ service_id, user_id, request_time }) => {
        const date = new Date(request_time).toISOString().split('T')[0]; // YYYY-MM-DD
        const key = `${service_id}-${date}`;
  
        if (!countMap.has(key)) {
          countMap.set(key, new Set());
        }
        countMap.get(key).add(user_id); // Ensure unique users
      });
  
      // Step 3: Accumulate per service_id total and count of days
      const serviceDailyCounts = {};
  
      for (let [key, userSet] of countMap.entries()) {
        const [service_id] = key.split('-');
  
        if (!serviceDailyCounts[service_id]) {
          serviceDailyCounts[service_id] = { totalRequests: 0, days: 0 };
        }
  
        serviceDailyCounts[service_id].totalRequests += userSet.size;
        serviceDailyCounts[service_id].days += 1;
      }
  
      // Step 4: Fetch service names
      const { data: services, error: serviceError } = await supabase
        .from('services')
        .select('service_id, service_type');
  
      if (serviceError) {
        return res.status(500).json({ error: 'Error fetching service types', details: serviceError.message });
      }
  
      // Step 5: Combine final result
      const result = Object.entries(serviceDailyCounts).map(([service_id, { totalRequests, days }]) => {
        const service = services.find(s => s.service_id == service_id);
        return {
            service_type: service?.service_type || 'Unknown',
            average_requests: totalRequests / days  // no rounding
          };          
      });
  
      res.json({ averages: result });
  
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  


module.exports = { getAverageRequestsPerService}