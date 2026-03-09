const mongoose = require('mongoose');

const CoordinatorSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  } // hashed password
}, { timestamps: true });

// Force collection name "coordinators"
module.exports = mongoose.model('Coordinator', CoordinatorSchema, 'coordinators');