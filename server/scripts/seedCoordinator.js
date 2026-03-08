const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();
const Coordinator = require('../models/Coordinator');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photography_event');
  const username = 'admin';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  const existing = await Coordinator.findOne({ username });
  if (existing) {
    console.log('Coordinator already exists');
  } else {
    const coord = new Coordinator({ username, password: hash });
    await coord.save();
    console.log('Coordinator created with username:', username, 'password:', password);
  }
  mongoose.disconnect();
}

seed().catch(console.error);
