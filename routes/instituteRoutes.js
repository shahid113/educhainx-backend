const express = require('express');
const router = express.Router();
const { login, logout, getProfile, issueCertificate, fetchallCertificates, nonce } = require('../controllers/InstituteController');
const { instituteMiddleware } = require('../middleware/instituteMiddleware');

router.post('/nonce', nonce)
router.post('/login', login);
router.post('/logout', instituteMiddleware, logout);
router.get('/profile', instituteMiddleware, getProfile);
router.post('/issue-certificate', instituteMiddleware, issueCertificate);
router.get('/fetch-certificates', instituteMiddleware, fetchallCertificates);

module.exports = router;
