const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['University','College','School','ITI','Polytechnic','Research'], 
    required: true 
  },

  instituteCode: { type: String, required: true, unique: true }, // AISHE / UDISE / ITI
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true }, // blockchain

  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },

  status: { 
    type: String, 
    enum: ['pending','approved','revoked'], 
    default: 'pending' 
  },

  // -----------------------------
  // OPTIONAL FIELDS (New)
  // -----------------------------

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
