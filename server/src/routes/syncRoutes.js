const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { requireAuth } = require('../middleware/auth');

router.post('/progress', requireAuth, syncController.syncProgress);

module.exports = router;
