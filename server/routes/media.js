const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");

// -----------------------------
// Multer storage configuration
// -----------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// -----------------------------
// Get all media
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const media = await Media.find().sort({ votes: -1 });
    res.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

// -----------------------------
// Get media with voters
// -----------------------------
router.get("/voters", async (req, res) => {
  try {
    const defaultData = { photos: [], videos: [] };
    const allMedia = await Media.find().sort({ votes: -1 });
    
    allMedia.forEach(m => {
      const item = {
        mediaId: m._id,
        title: m.title,
        voteCount: m.votes,
        voters: m.voters
      };
      if (m.type === 'photo') defaultData.photos.push(item);
      else if (m.type === 'video') defaultData.videos.push(item);
    });
    
    res.json(defaultData);
  } catch (error) {
    console.error("Get voters error:", error);
    res.status(500).json({ message: "Failed to fetch voters data" });
  }
});

// -----------------------------
// Upload media
// -----------------------------
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const media = new Media({
      title,
      type,
      url: `/uploads/${req.file.filename}`,
      votes: 0
    });

    await media.save();

    res.json({ message: "Upload successful", media });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// -----------------------------
// Delete media
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Optional: Delete file from disk
    const filename = media.url.split('/').pop();
    const filepath = path.join(__dirname, "../uploads/", filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});

// -----------------------------
// Update media title
// -----------------------------
router.put("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id, 
      { title }, 
      { new: true }
    );
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.json(media);
  } catch (error) {
    console.error("Update media error:", error);
    res.status(500).json({ message: "Failed to update media" });
  }
});

module.exports = router;