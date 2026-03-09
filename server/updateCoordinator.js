const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Coordinator = require('./models/Coordinator');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const newPassword = 'orlia2k26';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the coordinator with username 'mkce'
    const result = await Coordinator.findOneAndUpdate(
      { username: 'mkce' },
      { password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log('Coordinator updated successfully!');
      console.log('Username:', result.username);
      console.log('New password (plain):', newPassword);
    } else {
      console.log('Coordinator not found with username "mkce"');
    }
    
    process.exit();
  })
  .catch(err => console.error(err));

