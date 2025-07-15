const express = require('express');
const { body } = require('express-validator');
const upload = require('../middleware/uploadMedia');


const {
  createTweet,
  getTweets,
  getTweetById,
  getUserTweets,
  getHomeFeed,
  likeTweet,
  retweetTweet,
  addComment,
  searchTweets,
  getTrendingHashtags,
  deleteTweet
} = require('../controllers/tweetController');
const { protect, optional } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createTweetValidation = [
  body('content').trim().isLength({ min: 1, max: 280 }).withMessage('Tweet must be 1-280 characters')
];

const commentValidation = [
  body('content').trim().isLength({ min: 1, max: 280 }).withMessage('Comment must be 1-280 characters')
];

// Routes
router.post('/', protect, upload.array('media'), createTweetValidation, createTweet);
router.get('/', optional, getTweets);
router.get('/feed', protect, getHomeFeed);
router.get('/trending', getTrendingHashtags);
router.get('/search', searchTweets);
router.get('/user/:userId', getUserTweets);
router.get('/:tweetId', optional, getTweetById);
router.post('/:tweetId/like', protect, likeTweet);
router.post('/:tweetId/retweet', protect, retweetTweet);
router.post('/:tweetId/comment', protect, commentValidation, addComment);
router.delete('/:tweetId', protect, deleteTweet);

module.exports = router;