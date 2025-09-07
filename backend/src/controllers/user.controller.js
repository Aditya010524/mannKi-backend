import { User, AuthToken } from '../models/index.js';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';
import asyncHandler from '../utils/async-handler.js';
import logger from '../config/logger.config.js';
import configEnv from '../config/env.config.js';

class UserController {
  // Get current user profile
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;

    return ApiResponse.success(res, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar || configEnv.DEFAULT_PROFILE_URL, // Not saving avatar in db directly coming from the CDN
        coverPhoto: user.coverPhoto,
        location: user.location,
        website: user.website,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        role: user.role,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        tweetsCount: user.tweetsCount,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      },
    });
  });

  // Update user profile
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Start with text updates
    const updates = { ...req.body };

    // Handle avatar if uploaded
    if (req.files?.avatar) {
      // later you’ll upload this to Cloudinary/S3 and get a URL
      // for now just placeholder path
      updates.avatar = `/uploads/${req.files.avatar[0].originalname}`;
    }

    // Handle coverPhoto if uploaded
    if (req.files?.coverPhoto) {
      updates.coverPhoto = `/uploads/${req.files.coverPhoto[0].originalname}`;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) throw ApiError.notFound('User not found');

    return ApiResponse.success(res, {
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        location: user.location,
        website: user.website,
        dateOfBirth: user.dateOfBirth,
      },
    });
  });

  // Update Username
  updateUsername = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid current password');
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      throw ApiError.conflict('Username is already taken');
    }

    // Update username
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { username },
      { new: true, runValidators: true }
    );

    logger.info(`Username updated for user: ${user.email} - New username: ${username}`);

    return ApiResponse.success(res, {
      message: 'Username updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
      },
    });
  });

  // Update Email
  // updateEmail = asyncHandler(async (req, res) => {
  //   const { email, password } = req.body;
  //   const userId = req.user._id;

  //   const user = await User.findById(userId).select('+password');

  //   if (!user) {
  //     throw ApiError.notFound('User not found');
  //   }

  //   // Verify current password
  //   const isValidPassword = await user.comparePassword(password);
  //   if (!isValidPassword) {
  //     throw ApiError.unauthorized('Invalid current password');
  //   }

  //   // Check if email is already taken by another user
  //   const existingUser = await User.findOne({
  //     email,
  //     _id: { $ne: user._id },
  //   });

  //   if (existingUser) {
  //     throw ApiError.conflict('Email is already registered');
  //   }

  //   // Update email and mark as unverified
  //   const updatedUser = await User.findByIdAndUpdate(
  //     user._id,
  //     {
  //       email,
  //       isVerified: false, // Reset verification status
  //     },
  //     { new: true, runValidators: true }
  //   );

  //   logger.info(`Email updated for user: ${user.email} - New email: ${email}`);

  //   // Generate email verification token
  //   const verificationToken = await authService.createEmailVerificationToken(user._id);

  //   // Send verification email
  //   await emailService.sendVerificationEmail(user.email, verificationToken, user.displayName);

  //   return ApiResponse.success(res, {
  //     message: 'Email updated successfully. Please verify your new email address.',
  //     user: {
  //       id: updatedUser._id,
  //       username: updatedUser.username,
  //       email: updatedUser.email,
  //       isVerified: updatedUser.isVerified,
  //     },
  //   });
  // });

  // Update Password
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password field (since it's select: false by default)
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid current password');
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw ApiError.badRequest('New password must be different from current password');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);

    return ApiResponse.success(res, {
      message: 'Password updated successfully',
    });
  });

  // Logout from current device -(refreshToken required)
  logout = asyncHandler(async (req, res) => {
    // In dev: token may come from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    const userId = req.user._id.toString();

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token is required for logout', 400);
    }

    // Remove / revoke refresh token from DB
    const removed = await authService.removeRefreshToken(refreshToken, userId);

    if (!removed) {
      return ApiResponse.error(res, 'Invalid or already revoked refresh token', 400);
    }

    // Clear cookie regardless (good hygiene, even if invalid token)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/', // That ensures you clear the refresh token cookie globally (no matter which route set it).
    });

    logger.info(`User logged out: ${req.user.email}`);

    return ApiResponse.success(res, {
      message: 'Logout successful',
    });
  });

  // Logout from all devices -(refreshToken required)
  logoutAll = asyncHandler(async (req, res) => {
    // In dev: token may come from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    const userId = req.user._id.toString();

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token is required for logout', 400);
    }

    // Get device info before revoking (optional)
    const activeTokens = await authService.getUserActiveSessions(userId);

    // Revoke all refresh tokens for this user
    const revokedCount = await authService.removeAllUserTokens(userId);

    // Always clear the cookie (even if no active sessions found)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/', // Clear globally
    });

    logger.info(`User logged out from all devices: ${req.user.email} (${revokedCount} sessions)`);

    return ApiResponse.success(res, {
      message: `Successfully logged out from all devices (${revokedCount} sessions)`,
      revokedSessions: revokedCount,
      devices: activeTokens.map((t) => ({
        userAgent: t.userAgent,
        deviceName: t.device || 'Unknown Device',
        lastUsed: t.lastUsed,
      })),
    });
  });

  // Get active sessions -(refreshToken required)
  getSessions = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();

    const sessions = await authService.getUserActiveSessions(userId);

    // Get current token to identify the current session
    const currentRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
    let currentTokenId = null;

    if (currentRefreshToken) {
      // Extract tokenId from current refresh token
      const decoded = authService.validateToken(currentRefreshToken, configEnv.JWT.REFRESH_SECRET);
      currentTokenId = decoded.tokenId;
    }

    // sessionWithCurrent -> mean we get all the session except current session and we didn't use it here depend on UI
    const sessionsWithCurrent = sessions.filter((session) => session.id !== currentTokenId);

    if (sessions.length === 0) {
      return ApiResponse.success(res, {
        message: 'No Actie sessions, Please login.',
      });
    }

    logger.info(`Sessions retrieved for user: ${req.user.email} (${sessions.length} active)`);

    return ApiResponse.success(res, {
      message: 'Active sessions retrieved successfully',
      // currentActiveSessions: sessionsWithCurrent,
      totalSessions: sessions.length,
      sessions: sessions,
    });
  });

  // Remove specific session
  removeSession = asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    const userId = req.user._id.toString();

    if (!tokenId) {
      throw ApiError.badRequest('Token ID is required');
    }

    await authService.removeSpecificSession(userId, tokenId);

    logger.info(`Session removed for user: ${req.user.email}, tokenId: ${tokenId}`);

    return ApiResponse.success(res, {
      message: 'Session removed successfully',
    });
  });

  // Delete user account
  deleteAccount = asyncHandler(async (req, res) => {
    const { password, confirmDelete } = req.body;
    const userId = req.user._id.toString();

    // Get user with password
    const user = await User.findById(userId).select('+password');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Incorrect password');
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    // Revoke all tokens
    await authService.removeAllUserTokens(userId);

    logger.info(`Account deleted for user: ${user.email}`);

    return ApiResponse.success(res, {
      message: 'Account deleted successfully',
    });
  });

  // Search users
  searchUsers = asyncHandler(async (req, res) => {
    const {
      q: searchTerm,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    const currentUserId = req.user._id.toString();

    if (!searchTerm || searchTerm.trim().length < 2) {
      throw ApiError.badRequest('Search term must be at least 2 characters long');
    }

    const result = await userService.searchUsers(
      searchTerm.trim(),
      { page: parseInt(page), limit: parseInt(limit), sortBy, sortOrder },
      currentUserId
    );

    logger.info(
      `User search performed by ${req.user.email}: "${searchTerm}" - ${result.users.length} results`
    );

    return ApiResponse.success(res, {
      message: `Found ${result.pagination.totalCount} users`,
      ...result,
    });
  });

  // Get all user in Database
  getAllUsers = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verified,
      isPrivate,
    } = req.query;
    const currentUserId = req.user._id.toString();

    const result = await userService.getAllUsers(
      {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        verified,
        isPrivate,
      },
      currentUserId
    );

    logger.info(`All users retrieved by ${req.user.email} - ${result.users.length} results`);

    return ApiResponse.success(res, {
      message: `Retrieved ${result.pagination.totalCount} users`,
      ...result,
    });
  });

  // Get user by ID (when we click on the user)
  getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    const user = await userService.getUserById(userId, currentUserId);

    logger.info(`User profile viewed: ${userId} by ${req.user.email}`);

    return ApiResponse.success(res, {
      message: 'User profile retrieved successfully',
      user,
    });
  });

  // Get user statistics
  getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const stats = await userService.getUserStats(userId);

    return ApiResponse.success(res, {
      message: 'User statistics retrieved successfully',
      stats,
    });
  });

  // Get suggested users
  getSuggestedUsers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const currentUserId = req.user._id.toString();

    const users = await userService.getSuggestedUsers(currentUserId, parseInt(limit));

    logger.info(`Suggested users retrieved by ${req.user.email} - ${users.length} suggestions`);

    return ApiResponse.success(res, {
      message: `Found ${users.length} suggested users`,
      users,
    });
  });
}

export const userController = new UserController();
