const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/music-player",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/songs", require("./routes/songs"));
app.use("/api/playlists", require("./routes/playlists"));

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
const songsDir = path.join(uploadsDir, "songs");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir);
}

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
