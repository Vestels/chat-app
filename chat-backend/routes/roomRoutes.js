// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
} = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:roomId', getRoom);
router.put('/:roomId', updateRoom);

module.exports = router;