import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { connect } from "mongoose";
import { join } from "path";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

// Initialize app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Optional: exit process if MongoDB connection fails
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", protect, employeeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define a route for the root URL (for development/testing)
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Serve static files (for React or frontend) in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "client/build")));

  // Ensure all non-API requests fallback to React's index.html
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "client/build", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Server Error" });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
