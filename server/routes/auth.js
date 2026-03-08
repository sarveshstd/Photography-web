const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Student = require('../models/Student');
const Coordinator = require('../models/Coordinator');

// student login/register
router.post('/student-login', async (req, res) => {
  const { registerNumber } = req.body;
  if (!registerNumber) return res.status(400).json({ message: 'Register number required' });

  // Validation: 9276 + 22/23/24/25 + 3 letters + 2-3 numbers (e.g., 927622bal039)
  const registerRegex = /^9276[2][2-5][a-zA-Z]{3}[0-9]{2,3}$/;
  if (!registerRegex.test(registerNumber)) {
    return res.status(400).json({ message: 'Invalid register number' });
  }

  try {
    let student = await Student.findOne({ registerNumber });
    if (!student) {
      student = new Student({ registerNumber });
      await student.save();
    }
    // issue a simple token containing registerNumber and id
    const payload = { id: student._id, registerNumber, isStudent: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// coordinator login
router.post('/coordinator-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const coord = await Coordinator.findOne({ username });
    if (!coord) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, coord.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: coord._id, username: coord.username, isCoordinator: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
