const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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

module.exports = router;