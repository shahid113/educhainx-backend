const express = require('express');
const {login, instituteRegister, approve, revoke, getInstitutes, logout, getProfile} = require('../controllers/GovernmentController')
const {governmentMiddleware}=require('../middleware/governmentMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/add-institute', governmentMiddleware, instituteRegister);
router.get('/get-institute', governmentMiddleware, getInstitutes);
router.put('/approve-institute', governmentMiddleware, approve);
router.put('/revoke-institute', governmentMiddleware, revoke);
router.post('/logout', governmentMiddleware, logout );
router.get('/profile', governmentMiddleware, getProfile)

module.exports = router;