const express = require('express');
const VerifierController = require('../controllers/VerifierController');

const router = express.Router();

router.post('/verify', VerifierController.verify);

module.exports = router;