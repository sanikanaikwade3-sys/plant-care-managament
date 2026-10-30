
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");

dotenv.config();

// Set DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import plant routes
const plantRoutes = require("./routes/plantRoutes");

// Register API routes
app.use("/api/plants", plantRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Plant Care Management API is running");
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in .env file");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
