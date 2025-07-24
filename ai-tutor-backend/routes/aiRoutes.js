const express = require('express');
const router = express.Router();
const { handleDoubt } = require('../controllers/aiController');

router.post('/ask', handleDoubt);

module.exports = router;