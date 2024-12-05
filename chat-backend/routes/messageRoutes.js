// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/:roomId', getMessages);

module.exports = router;