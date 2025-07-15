const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.post('/read/:notificationId', markAsRead);
router.post('/read-all', markAllAsRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;