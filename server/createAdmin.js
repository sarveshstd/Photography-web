const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Coordinator = require('./models/Coordinator');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await Coordinator.create({
      username: 'admin',
      password: hashedPassword
    });

    console.log('Coordinator created');
    process.exit();
  })
  .catch(err => console.error(err));
