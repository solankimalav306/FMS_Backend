const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test route
app.get("/", (req, res) => {
    res.send("Node.js + Supabase Backend is Running 🚀");
});

// Test Supabase connection (Fetch all users from 'users' table)
app.get("/users", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
