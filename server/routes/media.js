const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "photography_event",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "avi"],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // increased to 50MB for video
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
router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer/Cloudinary exact error:", err);
      // Fallback to stringifying the whole error object if .message is missing
      const errorMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
      return res.status(500).json({ message: "Cloudinary storage error: " + errorMessage });
    }

    try {
      const { title, type } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded - check form data format" });
      }

      console.log("File uploaded to Cloudinary successfully:", req.file.path);

      const media = new Media({
        title,
        type,
        url: req.file.path, // Cloudinary provides the full URL in path
        votes: 0
      });

      await media.save();

      res.json({ message: "Upload successful", media });
    } catch (saveError) {
      console.error("Database save error:", saveError);
      res.status(500).json({ message: "Database save failed: " + saveError.message });
    }
  });
});

// -----------------------------
// Delete media
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Reset votes for students who voted for this media item
    const Student = require("../models/Student");
    if (media.type === 'photo') {
      await Student.updateMany({ votedPhoto: media._id }, { $set: { votedPhoto: null } });
    } else if (media.type === 'video') {
      await Student.updateMany({ votedVideo: media._id }, { $set: { votedVideo: null } });
    }

    // Optional: Delete file from Cloudinary (requires public_id extraction and cloudinary.uploader.destroy)
    // For now, we just remove the database entry to keep it simple and ensure the frontend works.
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