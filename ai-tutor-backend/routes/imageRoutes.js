const express = require('express');
const router = express.Router();
const { generateImageFromPrompt } = require('../controllers/imageController');

router.post('/generate-image', generateImageFromPrompt);

module.exports = router;