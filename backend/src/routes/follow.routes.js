import express from 'express';
import { followController } from '../controllers/follow.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import followValidation from '../validations/follow.validation.js';

const router = express.Router();

// All follow routes require authentication
router.use(authenticateUser);

// Follow a user
router.post(
  '/:userId',
  validate(followValidation.followUser, 'params'),
  followController.followUser
);

// Unfollow a user
router.delete(
  '/:userId',
  validate(followValidation.unfollowUser, 'params'),
  followController.unfollowUser
);

// Get user's followers list
router.get(
  '/:userId/followers',
  validate(followValidation.getFollowList, 'params'),
  followController.getFollowers
);

// Get user's following list
router.get(
  '/:userId/following',
  validate(followValidation.getFollowList, 'params'),
  followController.getFollowing
);

// ==========================================
// FOLLOW STATUS & UTILITIES
// ==========================================
// Check follow status with a user
router.get(
  '/:userId/status',
  validate(followValidation.getFollowStatus, 'params'),
  followController.getFollowStatus
);

// Get suggested users to follow
router.get('/suggestions', followController.getSuggestedUsers);

export default router;
