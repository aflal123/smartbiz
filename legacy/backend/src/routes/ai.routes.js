// src/routes/ai.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getInsights, getEmail, getSocialPost, chat } = require('../controllers/ai.controller');

router.use(protect);

router.get('/insights',      getInsights);
router.post('/email',        getEmail);
router.post('/social-post',  getSocialPost);
router.post('/chat',         chat);

module.exports = router;