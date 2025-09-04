import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { userController } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import userValidation from '../validations/user.validation.js';

const router = express.Router();

// ================= USER ROUTES (Protected) =================

// Current user info
router.get('/me', authenticateUser, userController.getCurrentUser);

// Update profile
router.put(
  '/me',
  authenticateUser,
  validate(userValidation.updateProfile),
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

export default router;
