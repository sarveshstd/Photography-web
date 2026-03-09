const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Allow frontend requests
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://*.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/photography_event";

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("Photography API running 🚀");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/media", require("./routes/media"));
app.use("/api/vote", require("./routes/vote"));
app.use("/api/student", require("./routes/student"));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});