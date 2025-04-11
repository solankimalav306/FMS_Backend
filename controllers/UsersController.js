const supabase = require("../config/supabaseClient");

const loginUser = async (req, res) => {
    const { User_ID, UserPassword } = req.body;

    if (!User_ID || !UserPassword) {
        return res.status(400).json({ error: "User_ID and password are required" });
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("userpassword, user_id, username, email, building, roomno")
            .eq("user_id", User_ID)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Invalid User_ID or password" });
        }


        if (UserPassword !== user.userpassword) {
            return res.status(401).json({ error: "Invalid User_ID or password" });
        }
        
        req.session.userID = user.user_id;
        console.log("✅ Session UserID Set:", req.session.userID);
        console.log("User Default Room Number:", req.session.userroomno);
        console.log("User Default Building:", req.session.userbuilding);
        const { userpassword, building, roomno, ...userWithoutData } = user;

        res.json({ message: "Login successful", user: userWithoutData });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchDefaultAddress = async (req, res) => {
    const { User_ID } = req.body;

    if (!User_ID) {
        return res.status(400).json({ error: "User_ID not found" });
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("building, roomno")
            .eq("user_id", User_ID)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Invalid User_ID" });
        }

        res.json({ message: "User Default Address Retrived", user: user });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const num21 = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .rpc('get_users_in_files_not_requests');

        if (error || !user) {
            return res.status(401).json({ error: "Error fetching users", details: error });
        }

        res.json({ user });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const num19 = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_active_users'); // Placeholder for a SQL function

        if (error) {
            return res.status(401).json({ error: "Error fetching users", details: error.message });
        }

        res.json({ users: data });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { loginUser, fetchDefaultAddress, num21, num19 };
