const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/music-player",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(adminUser.password, salt);

    // Save admin user
    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
