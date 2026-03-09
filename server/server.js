const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// -------------------------------
// Create uploads folder if missing
// -------------------------------
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads folder created");
}

// -------------------------------
// Serve uploaded files
// -------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------
// MongoDB connection
// -------------------------------
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/photography_event";

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// -------------------------------
// API test route
// -------------------------------
app.get("/", (req, res) => {
  res.send("Photography API running 🚀");
});

// -------------------------------
// Routes
// -------------------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/media", require("./routes/media"));
app.use("/api/vote", require("./routes/vote"));
app.use("/api/student", require("./routes/student"));

// -------------------------------
// Start server
// -------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});