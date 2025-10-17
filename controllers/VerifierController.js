const BlockchainService = require('../services/BlockchainService');

exports.verify = async (req, res) => {
  const { providedHash } = req.body;
  try {
    const result = await BlockchainService.verifyCertificate(providedHash); 
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



