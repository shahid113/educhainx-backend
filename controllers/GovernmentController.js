const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institute = require('../models/Institute');
const BlockchainService = require('../services/BlockchainService');
const { ethers } = require('ethers');

const isProduction = process.env.NODE_ENV === 'production';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    const user = await User.findOne({ username });

    if (!user || user.role !== 'government') {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: 'government' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure:isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path:'/'
    });

    res.json({ message: 'Login successful', role: 'government' });
  } catch (err) {
    console.error('Government login error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:isProduction,
    sameSite:isProduction ? 'None' : 'Lax',
    path:'/'
  });
  res.json({ message: 'Logout successful' });
}

exports.instituteRegister = async (req, res) => {
  const {
    name,
    type,
    instituteCode,
    email,
    walletAddress,
    address,
    district,
    state,
    country
  } = req.body;

  // Basic validation
  if (!name || !type || !instituteCode || !email || !walletAddress || !address || !district || !state) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check for duplicates
    const existing = await Institute.findOne({ $or: [{ instituteCode }, { email }, { walletAddress }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Institute already registered' });
    }

    const institute = new Institute({
      name,
      type,
      instituteCode,
      email,
      walletAddress,
      address,
      district,
      state,
      country
    });

    await institute.save();
    res.json({ success: true, message: 'Registration submitted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getInstitutes = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const institutes = await Institute.find(filter);
    res.json(institutes);

  } catch (err) {
    console.error('Error fetching institutes:', err.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.approve = async (req, res) => {
  const { id, walletAddress } = req.body;

  try {
    // --- Validation ---
    if (!id || !walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid ID or Ethereum address.' });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found.' });
    }

    // --- Check if already approved on blockchain ---
    const alreadyApproved = await BlockchainService.isApprovedIssuer(walletAddress);
    if (alreadyApproved) {
      return res.status(409).json({ error: 'Institute already approved on-chain.' });
    }

    // --- Execute Blockchain Transaction ---
    let txHash;
    try {
      const tx = await BlockchainService.addIssuer(walletAddress);
      txHash = tx; // since BlockchainService returns tx.hash
      console.log(`[BLOCKCHAIN] Approve TX confirmed: ${txHash}`);
    } catch (chainErr) {
      console.error('[BLOCKCHAIN ERROR]', chainErr.message);
      return res.status(500).json({ error: 'Blockchain approval failed: ' + chainErr.message });
    }

    // --- Update Database Only After Success ---
    await Institute.findByIdAndUpdate(id, { status: 'approved' });
    console.log(`[DATABASE] Institute ${walletAddress} marked as approved.`);

    return res.json({
      success: true,
      txHash,
      message: 'Institute approved and successfully whitelisted on blockchain.',
    });

  } catch (err) {
    console.error('[APPROVE ERROR]', err.message);
    return res.status(500).json({ error: 'Approval process failed: ' + err.message });
  }
};


exports.revoke = async (req, res) => {
  const { id, walletAddress } = req.body;

  try {
    // --- Validation ---
    if (!id || !walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid ID or Ethereum address.' });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found.' });
    }

    // --- Check if approved on blockchain ---
    const isApproved = await BlockchainService.isApprovedIssuer(walletAddress);
    if (!isApproved) {
      return res.status(409).json({ error: 'Institute not currently approved on-chain.' });
    }

    // --- Execute Blockchain Transaction ---
    let txHash;
    try {
      const tx = await BlockchainService.removeIssuer(walletAddress);
      txHash = tx;
      console.log(`[BLOCKCHAIN] Revoke TX confirmed: ${txHash}`);
    } catch (chainErr) {
      console.error('[BLOCKCHAIN ERROR]', chainErr.message);
      return res.status(500).json({ error: 'Blockchain revoke failed: ' + chainErr.message });
    }

    // --- Update Database Only After Success ---
    await Institute.findByIdAndUpdate(id, { status: 'revoked' });
    console.log(`[DATABASE] Institute ${walletAddress} marked as revoked.`);

    return res.json({
      success: true,
      txHash,
      message: 'Institute revoked and removed from blockchain whitelist.',
    });

  } catch (err) {
    console.error('[REVOKE ERROR]', err.message);
    return res.status(500).json({ error: 'Revocation process failed: ' + err.message });
  }
};

