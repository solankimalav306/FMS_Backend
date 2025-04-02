const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const UserRoutes = require("./routes/UserRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const ServiceRoutes = require("./routes/ServiceRoutes");
const RequestRoutes = require("./routes/RequestRoutes");
const WorkerRoutes = require("./routes/WorkerRoutes");
const FmsAdminRoutes = require("./routes/FmsAdminRoutes");
const ComplaintRoutes = require("./routes/ComplaintRoutes");

const app = express();

// 🛠️ Middleware Order Matters!
app.use(session({
    secret: "jhaadupocha123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }
}));

app.use(express.json()); // JSON middleware AFTER session
app.use(cors());

app.get("/", (req, res) => {
    res.send("Node.js + Supabase Backend is Running 🚀");
});

app.get("/sessionUserID", (req, res) => {
    if (req.session.userID) {
      res.json({ userID: req.session.userID });
    } else {
      res.json({ error: "No session found" });
    }
  });

app.use("/users", UserRoutes);
app.use("/orders", OrderRoutes);
app.use("/services", ServiceRoutes);
app.use("/request", RequestRoutes);
app.use("/worker", WorkerRoutes);
app.use("/admin", FmsAdminRoutes);
app.use("/complaint", ComplaintRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
