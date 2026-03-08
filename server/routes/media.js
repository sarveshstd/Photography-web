const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const Media = require('../models/Media');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// public listing for students (no auth)
router.get('/public', async (req, res) => {
  try {
    const items = await Media.find().sort({ createdAt: -1 });
    const fs = require('fs');
    const valid = [];
    for (const item of items) {
      const filePath = path.join(__dirname, '..', item.url);
      if (fs.existsSync(filePath)) {
        valid.push(item);
      } else {
        // stale database record, remove it
        await item.deleteOne();
        console.warn('Removed stale media record:', item._id);
      }
    }
    res.json(valid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all media (coordinator only)
router.get('/', auth, async (req, res) => {
  try {
    const items = await Media.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// upload new media
router.post('/', auth, upload.single('file'), async (req, res) => {
  const { title, type } = req.body;
  if (!title || !type) return res.status(400).json({ message: 'Title and type required' });

  if (!req.file) return res.status(400).json({ message: 'File upload required' });

  try {
    const url = '/uploads/' + req.file.filename;
    const media = new Media({ title, type, url });
    await media.save();
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// edit title
router.put('/:id', auth, async (req, res) => {
  const { title } = req.body;
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    media.title = title || media.title;
    await media.save();
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete media
router.delete('/:id', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const media = await Media.findById(req.params.id).session(session);
    if (!media) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Media not found' });
    }

    const mediaId = media._id;
    const mediaType = media.type;

    // Clear vote references in all students who voted for this media
    const updateField = mediaType === 'photo' ? 'votedPhoto' : 'votedVideo';
    await Student.updateMany(
      { [updateField]: mediaId },
      { $set: { [updateField]: null } },
      { session }
    );

    // delete file from disk
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', media.url);
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Failed to delete file', err);
    });

    await media.deleteOne({ session });
    await session.commitTransaction();
    res.json({ message: 'Media removed' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const list = await Media.find().sort({ votes: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all voters grouped by photo and video
router.get('/voters', auth, async (req, res) => {
  try {
    const photos = await Media.find({ type: 'photo' }).select('title voters').sort({ votes: -1 });
    const videos = await Media.find({ type: 'video' }).select('title voters').sort({ votes: -1 });
    
    const photoVoters = photos.map(p => ({
      title: p.title,
      mediaId: p._id,
      voters: p.voters,
      voteCount: p.voters.length
    }));
    
    const videoVoters = videos.map(v => ({
      title: v.title,
      mediaId: v._id,
      voters: v.voters,
      voteCount: v.voters.length
    }));
    
    res.json({ photos: photoVoters, videos: videoVoters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
