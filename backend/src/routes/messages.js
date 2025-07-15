const express = require('express');
const { body } = require('express-validator');
const {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const sendMessageValidation = [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
];

// Routes (specific before dynamic)
router.get('/conversations', getConversations);
router.post('/read/:conversationId', markConversationAsRead); // ✅ Specific first
router.get('/:conversationId', getMessages); // 🔁 Dynamic after
router.post('/', sendMessageValidation, sendMessage);

module.exports = router;
