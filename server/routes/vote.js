const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Media = require('../models/Media');

// helper to record vote
async function castVote(studentId, mediaId, field) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // Check if student is blocked
  if (student.isBlocked) {
    throw new Error('You are blocked from voting');
  }

  if (field === 'photo' && student.votedPhoto) {
    throw new Error('Already voted for photo');
  }
  if (field === 'video' && student.votedVideo) {
    throw new Error('Already voted for video');
  }

  const media = await Media.findById(mediaId);
  if (!media) throw new Error('Media not found');

  if (media.type !== field) {
    throw new Error('Media type mismatch');
  }

  // update both documents atomically
  student['voted' + (field === 'photo' ? 'Photo' : 'Video')] = media._id;
  media.votes += 1;
  if (!media.voters.includes(student.registerNumber)) {
    media.voters.push(student.registerNumber);
  }

  await student.save();
  await media.save();
  return { student, media };
}

// vote photo
router.post('/photo', auth, async (req, res) => {
  const { mediaId } = req.body;
  try {
    const result = await castVote(req.user.id, mediaId, 'photo');
    res.json({ message: 'Photo vote recorded', media: result.media, student: result.student });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// vote video
router.post('/video', auth, async (req, res) => {
  const { mediaId } = req.body;
  try {
    const result = await castVote(req.user.id, mediaId, 'video');
    res.json({ message: 'Video vote recorded', media: result.media, student: result.student });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Remove a vote and block the voter (spam prevention)
router.delete('/remove', auth, async (req, res) => {
  const { registerNumber, mediaId, type } = req.body;
  
  try {
    // Find the student by register number
    const student = await Student.findOne({ registerNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the media
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Check if student voted for this media
    const field = type === 'photo' ? 'votedPhoto' : 'votedVideo';
    const mediaIdStr = mediaId.toString();
    
    const studentVotedField = student[field]?.toString();
    if (studentVotedField !== mediaIdStr) {
      return res.status(400).json({ message: 'Student did not vote for this media' });
    }

    // Remove vote from student (set to null) AND block them
    student[field] = null;
    student.isBlocked = true; // Block the voter permanently
    await student.save();

    // Remove voter from media and decrement votes
    media.voters = media.voters.filter(v => v !== registerNumber);
    media.votes = Math.max(0, (media.votes || 1) - 1);
    await media.save();

    res.json({ message: 'Vote removed and voter blocked', student, media });
  } catch (err) {
    console.error('Remove vote error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Coordinator manual vote addition
router.post('/coordinator-add', auth, async (req, res) => {
  const { registerNumber, mediaId, type } = req.body;
  
  // Check if user is coordinator
  if (!req.user.isCoordinator) {
    return res.status(403).json({ message: 'Only coordinators can add votes manually' });
  }

  try {
    // Validate register number format
    const registerRegex = /^9276[2][2-5][a-zA-Z]{3}[0-9]{2,3}$/;
    if (!registerRegex.test(registerNumber)) {
      return res.status(400).json({ message: 'Invalid register number format' });
    }

    // Find or create student
    let student = await Student.findOne({ registerNumber });
    if (!student) {
      student = new Student({ registerNumber });
      await student.save();
    }

    // Check if student is blocked
    if (student.isBlocked) {
      return res.status(400).json({ message: 'This student is blocked from voting' });
    }

    // Check if student already voted for this type
    const field = type === 'photo' ? 'votedPhoto' : 'votedVideo';
    if (student[field]) {
      return res.status(400).json({ message: `Student already voted for ${type}` });
    }

    // Find the media
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.type !== type) {
      return res.status(400).json({ message: 'Media type mismatch' });
    }

    // Add vote
    student[field] = media._id;
    media.votes += 1;
    if (!media.voters.includes(registerNumber)) {
      media.voters.push(registerNumber);
    }

    await student.save();
    await media.save();

    res.json({ 
      message: 'Vote added successfully by coordinator', 
      media, 
      student,
      addedByCoordinator: true 
    });
  } catch (err) {
    console.error('Coordinator add vote error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
