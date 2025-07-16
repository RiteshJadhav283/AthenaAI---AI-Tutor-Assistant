const express = require('express');
const router = express.Router();
const { handleDoubt } = require('../controllers/aiController');

router.post('/doubt', handleDoubt);

module.exports = router;