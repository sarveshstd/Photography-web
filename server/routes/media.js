const express = require("express");
const router = express.Router();
const multer = require("multer");
const Media = require("../models/Media");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage - we'll stream the file directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Helper: upload a buffer to Cloudinary using upload_stream
function uploadToCloudinary(buffer, resourceType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "photography_event",
        resource_type: resourceType || "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

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

    allMedia.forEach((m) => {
      const item = {
        mediaId: m._id,
        title: m.title,
        voteCount: m.votes,
        voters: m.voters,
      };
      if (m.type === "photo") defaultData.photos.push(item);
      else if (m.type === "video") defaultData.videos.push(item);
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

    // Determine Cloudinary resource type
    const resourceType = type === "video" ? "video" : "image";

    // Upload the file buffer directly to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, resourceType);

    const media = new Media({
      title,
      type,
      url: result.secure_url, // Permanent Cloudinary URL
      votes: 0,
    });

    await media.save();

    res.json({ message: "Upload successful", media });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed: " + error.message });
  }
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
    if (media.type === "photo") {
      await Student.updateMany(
        { votedPhoto: media._id },
        { $set: { votedPhoto: null } }
      );
    } else if (media.type === "video") {
      await Student.updateMany(
        { votedVideo: media._id },
        { $set: { votedVideo: null } }
      );
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