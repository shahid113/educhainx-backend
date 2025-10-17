const jwt = require('jsonwebtoken');
const blockchainService = require('../services/BlockchainService');
const { ethers } = require('ethers');
const Institute = require('../models/Institute');
const Certificate = require('../models/Certificate');
const { Nonce } = require('../models/Nonce');


exports.nonce = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ message: "Wallet required" });

  // Generate a random nonce
  const nonce = "Login nonce: " + Math.floor(Math.random() * 1000000);

  try {
    // Upsert: if wallet already exists, update nonce; else create new
    await Nonce.findOneAndUpdate(
      { walletAddress },
      { nonce, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: nonce });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

exports.login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature)
      return res.status(400).json({ message: 'Missing walletAddress or signature' });

    // Fetch the nonce from MongoDB
    const nonceRecord = await Nonce.findOne({ walletAddress });
    if (!nonceRecord)
      return res.status(400).json({ message: 'Nonce not found or expired' });

    const message = nonceRecord.nonce;

    // Verify signature against the nonce
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase())
      return res.status(401).json({ message: 'Signature verification failed' });

    // Check if institute is approved on blockchain
    const isApproved = await blockchainService.isApprovedIssuer(walletAddress);
    console.log('Is Approved Issuer:', isApproved);

    if (!isApproved)
      return res.status(403).json({ message: 'Institute not approved by government' });

    // Find the institute in the database to get its _id
    const institute = await Institute.findOne({ walletAddress: walletAddress });
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found in our database.' });
    }

    // Generate JWT token with walletAddress AND _id
    const payload = {
      walletAddress: institute.walletAddress,
      _id: institute._id // <-- The crucial addition
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Delete used nonce
    await Nonce.deleteOne({ walletAddress });

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true on Render only
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.status(200).json({ walletAddress, message: 'Login successful' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.logout = async (req, res) => {
    res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logout successful' });
};

exports.getProfile = async (req, res) => {
  try {
    // 1. Check for the institute's _id from the middleware-decoded token.
    if (!req.institute || !req.institute._id || !req.institute.walletAddress) {
      return res.status(401).json({ error: 'Authentication error. Institute ID not found in token.' });
    }

    const institute = await Institute.findById(req.institute._id).select('-__v');

    if (!institute) {
      return res.status(404).json({ error: 'Institute profile not found.' });
    }

    res.status(200).json(institute);

  } catch (err) {
    console.error('Error fetching institute profile:', err);
    res.status(500).json({ error: 'Server error while fetching profile.' });
  }
};

exports.issueCertificate = async (req, res) => {
  try {
    // Ensure middleware attached institute info. This object should contain the _id.
    if (!req.institute || !req.institute._id) {
      return res.status(401).json({ message: 'Unauthorized access. Institute not found in token.' });
    }

    const {
      certificateNo,
      dateofIssue,
      name,
      enrolmentNo,
      graduationYear,
      degree,
      transactionHash,
    } = req.body;

    if (
      !certificateNo ||
      !dateofIssue ||
      !name ||
      !enrolmentNo ||
      !graduationYear ||
      !degree ||
      !transactionHash
    ) {
      return res.status(400).json({ error: 'Missing required certificate fields.' });
    }

    const certificate = new Certificate({
      certificateNo,
      dateofIssue,
      name,
      enrolmentNo,
      graduationYear,
      degree,
      instituteId: req.institute._id,
      transactionHash
    });

    await certificate.save();

    res.status(201).json({ message: 'Certificate issued successfully.', certificate });
  } catch (err) {
    console.error('Error issuing certificate:', err);
    res.status(500).json({ error: 'Server error while issuing certificate.' });
  }
};

exports.fetchallCertificates = async (req, res) => {
  try {
    // Ensure the authenticated institute's ID is present from the token
    if (!req.institute || !req.institute._id) {
      return res.status(401).json({ message: 'Unauthorized access. Institute ID not found in token.' });
    }

    // Securely fetch certificates using the ID from the token, NOT from URL params
    const certificates = await Certificate.find({ instituteId: req.institute._id })
      .sort({ createdAt: -1 });

    if (!certificates || certificates.length === 0) {
      return res.status(200).json({ message: 'No certificates found for this institute.', data: [] });
    }

    res.status(200).json({
      message: 'Certificates fetched successfully',
      count: certificates.length,
      data: certificates
    });
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


