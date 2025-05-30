const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getAudioDuration } = require("get-audio-duration");
const Song = require("../models/Song");
const auth = require("../middleware/auth");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: "./uploads/songs",
  filename: function (req, file, cb) {
    cb(null, "song-" + Date.now() + path.extname(file.originalname));
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed file types
  const filetypes = /mp3|wav|mpeg|audio/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only audio files (MP3, WAV) are allowed!"));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Upload song (Admin only)
router.post("/upload", auth, upload.single("song"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Calculate audio duration
    const filePath = path.join(__dirname, "..", req.file.path);
    let duration;
    try {
      const durationMs = await getAudioDuration(filePath);
      duration = Math.round(durationMs / 1000); // Convert milliseconds to seconds
    } catch (durationError) {
      console.error("Error getting audio duration:", durationError);
      duration = 0; // Set a default duration if we can't get the actual duration
    }

    const { title, artist, album } = req.body;
    const newSong = new Song({
      title,
      artist,
      album,
      duration,
      fileUrl: `/uploads/songs/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

    await newSong.save();
    res.json(newSong);
  } catch (err) {
    console.error("Upload error:", err);
    // Clean up the uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }
    res.status(500).json({
      message: err.message || "Error uploading song",
      error: process.env.NODE_ENV === "development" ? err : undefined,
    });
  }
});

// Get all songs
router.get("/", auth, async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get song by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.json(song);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete song (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Delete the file from the uploads directory
    const filePath = path.join(__dirname, "..", song.fileUrl);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    await song.remove();
    res.json({ message: "Song removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
