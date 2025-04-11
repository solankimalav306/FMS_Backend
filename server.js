const express = require("express");
require("dotenv").config(); // Make sure you use process.env variables somewhere
const cors = require("cors");
const session = require("express-session");

// --- Require Routes FIRST (good practice) ---
const UserRoutes = require("./routes/UserRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const ServiceRoutes = require("./routes/ServiceRoutes");
const RequestRoutes = require("./routes/RequestRoutes");
const WorkerRoutes = require("./routes/WorkerRoutes");
const FmsAdminRoutes = require("./routes/FmsAdminRoutes");
const ComplaintRoutes = require("./routes/ComplaintRoutes");
const StatisticsRoutes = require("./routes/StatisticsRouter");

// --- Initialize Express App ---
const app = express(); // Initialize app HERE

// --- CORS Configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500']; // Add other frontend origins if needed
    // Allow requests with no origin OR from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`); // Log blocked origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Ensure PUT and OPTIONS are here
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any other custom headers you send
  credentials: true
};

// --- Apply CORS Middleware Globally (applies to all routes below) ---
// This handles both simple requests and pre-flight OPTIONS requests
app.use(cors(corsOptions));

// --- Other Global Middleware (AFTER CORS, BEFORE Routes needing them) ---
app.use(session({
  secret: "jhaadupocha123", // Use an environment variable for secrets! process.env.SESSION_SECRET
  resave: false,
  saveUninitialized: true,
  // For production with HTTPS, set secure: true
  // For Railway/Heroku proxies, you might need 'trust proxy: 1'
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' } // sameSite can help CSRF
}));

// Middleware to parse JSON request bodies (needed for POST/PUT/PATCH with JSON)
app.use(express.json());
// Middleware to parse URL-encoded request bodies (optional)
app.use(express.urlencoded({ extended: true }));


// --- Define Routes ---
app.get("/", (req, res) => {
  res.send("Node.js + Supabase Backend is Running 🚀");
});

app.get("/sessionUserID", (req, res) => {
  if (req.session.userID) {
    res.json({ userID: req.session.userID });
  } else {
    // It's better to send a specific status code for "not found" or "unauthorized"
    res.status(401).json({ error: "No active session found" });
  }
});

// --- Mount API Routers ---
app.use("/users", UserRoutes);
app.use("/orders", OrderRoutes);
app.use("/services", ServiceRoutes);
app.use("/request", RequestRoutes);
app.use("/worker", WorkerRoutes);
app.use("/admin", FmsAdminRoutes); // Ensure PUT '/update-user-location' is defined within this router
app.use("/complaint", ComplaintRoutes);
app.use("/statistics", StatisticsRoutes);

// --- Basic Error Handling (Optional but Recommended) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  // Specifically handle CORS errors if possible
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: "CORS Error: Origin not allowed." });
  }
  res.status(500).json({ error: "Internal Server Error" });
});


// --- Start Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));