const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const UserRoutes = require("./routes/UserRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const ServiceRoutes = require("./routes/ServiceRoutes");
const RequestRoutes = require("./routes/RequestRoutes");

const app = express();

// 🛠️ Middleware Order Matters!
app.use(session({
    secret: "jhaadupocha123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json()); // JSON middleware AFTER session
app.use(cors());

app.get("/", (req, res) => {
    res.send("Node.js + Supabase Backend is Running 🚀");
});

app.use("/users", UserRoutes);
app.use("/orders", OrderRoutes);
app.use("/services", ServiceRoutes);
app.use("/request", RequestRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
