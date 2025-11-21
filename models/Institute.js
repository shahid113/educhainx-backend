const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instituteCode: { type: String, required: true, unique: true }, // AISHE / UDISE / ITI
  email: { type: String, unique: true, required:true },
  walletAddress: { type: String, required: true, unique: true }, // blockchain
  status: { 
    type: String, 
    enum: ['pending','approved','revoked'], 
    default: 'pending' 
  },
  
  degrees: {
    type: [String], // Array of degree names
    default: []     // Optional
  },

  departments: {
    type: [String], // Array of department names
    default: []
  },

  logo: {
    type: String,   // URL or base64 string
    default: null,
  }

}, { timestamps: true });

module.exports = mongoose.model('Institute', instituteSchema);
