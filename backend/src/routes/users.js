const express = require('express');
const { body } = require('express-validator');
const upload = require('../middleware/uploadProfileImg');

const {
  getProfile,
  updateProfile,
  getUserByUsername,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const { protect, optional } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be 1-50 characters'),
  body('bio').optional().isLength({ max: 160 }).withMessage('Bio cannot exceed 160 characters'),
  body('location').optional().isLength({ max: 50 }).withMessage('Location cannot exceed 50 characters'),
  body('website').optional().isURL().withMessage('Please enter a valid website URL')
];

// Routes
router.get('/profile', protect, getProfile);
router.put(
  '/profile',protect,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  updateProfile
);

router.get('/profile/:username', optional, getUserByUsername);
router.get('/search', searchUsers);
router.post('/follow/:userId', protect, followUser);
router.post('/unfollow/:userId', protect, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;