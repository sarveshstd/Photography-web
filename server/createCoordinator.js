const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Coordinator = require("./models/Coordinator");

const username = "mkce";
const password = "orlia2k26";

async function createCoordinator() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing coordinator with username "mkce" to prevent duplicates
    await Coordinator.deleteOne({ username });
    console.log("Deleted any existing coordinator with username:", username);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new coordinator
    await Coordinator.create({
      username: username,
      password: hashedPassword
    });

    console.log("Coordinator created successfully");
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error("Error creating coordinator:", error);
    process.exit(1);
  }
}

createCoordinator();

