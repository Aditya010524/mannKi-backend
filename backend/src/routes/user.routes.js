import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { userController } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import userValidation from '../validations/user.validation.js';
import multer from 'multer';
import path from 'path';

// use memory storage for easy integration with Cloudinary/S3 later
// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save in uploads/ directory
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const router = express.Router();

// ================= USER ROUTES (Protected) =================

// Current user info
router.get('/me', authenticateUser, userController.getCurrentUser);

router.put(
  '/me',
  authenticateUser,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  validate(userValidation.updateProfile), // Joi still validates text fields
  userController.updateProfile
);

// Update Username
router.put(
  '/me/username',
  authenticateUser,
  validate(userValidation.updateUsername),
  userController.updateUsername
);

// Update Email
// router.put(
//   '/me/email',
//   authenticateUser,
//   validate(userValidation.updateEmail),
//   userController.updateProfile
// );

// Change password
router.post(
  '/change-password',
  authenticateUser,
  validate(userValidation.changePassword),
  userController.changePassword
);

// Logout current session
router.post('/logout', authenticateUser, userController.logout);

// Logout from all sessions
router.post('/logout-all', authenticateUser, userController.logoutAll);

// Get active sessions
router.get('/sessions', authenticateUser, userController.getSessions);

// Remove specific session
router.delete('/sessions/:tokenId', authenticateUser, userController.removeSession);

// Delete account
router.delete(
  '/me',
  authenticateUser,
  validate(userValidation.deleteAccount),
  userController.deleteAccount
);

// Search users
router.get(
  '/search',
  authenticateUser,
  validate(userValidation.searchUsers, 'query'),
  userController.searchUsers
);

// Get all users with pagination
router.get('/', authenticateUser, validate(userValidation.getAllUsers), userController.getAllUsers);

// Get suggested users
router.get(
  '/suggested',
  authenticateUser,
  validate(userValidation.getSuggestedUsers),
  userController.getSuggestedUsers
);

// Get user by ID
router.get(
  '/:userId',
  authenticateUser,
  validate(userValidation.getUserById, 'params'),
  userController.getUserById
);

// Get user statistics
router.get(
  '/:userId/stats',
  authenticateUser,
  validate(userValidation.getUserStats, 'params'),
  userController.getUserStats
);

export default router;
