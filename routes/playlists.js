const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const auth = require("../middleware/auth");

// Create playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const newPlaylist = new Playlist({
      name,
      description,
      isPublic,
      createdBy: req.user.id,
    });

    await newPlaylist.save();
    res.json(newPlaylist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get user's playlists
router.get("/my-playlists", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id })
      .populate("songs")
      .sort({ updatedAt: -1 });
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get playlist by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("songs")
      .populate("createdBy", "username");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user has access to the playlist
    if (
      !playlist.isPublic &&
      playlist.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add song to playlist
router.post("/:id/songs", auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Remove song from playlist
router.delete("/:id/songs/:songId", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    playlist.songs = playlist.songs.filter(
      (song) => song.toString() !== req.params.songId
    );

    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await playlist.remove();
    res.json({ message: "Playlist removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
