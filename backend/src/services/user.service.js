import { User } from '../models/index.js';
import ApiError from '../utils/api-error.js';
import mongoose from 'mongoose';

class UserService {
  // Search users by username, displayName, email
  async searchUsers(searchTerm, options = {}, currentUserId) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build search query
    const searchQuery = {
      $and: [
        // Exclude current user from search results
        { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } },
        // Only show active accounts
        { isActive: { $ne: false } },
        // Search in multiple fields
        {
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { displayName: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      ],
    };

    // Count total first
    const totalCount = await User.countDocuments(searchQuery);

    // Compute totalPages and clamp currentPage
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const currentPage = Math.min(Math.max(1, parseInt(page)), totalPages);
    const skip = (currentPage - 1) * limit;

    // Fetch users
    const users = await User.find(searchQuery)
      .select('username displayName bio avatar isVerified isPrivate followersCount createdAt')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return {
      users,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  // Get user by ID with public information
  async getUserById(userId, currentUserId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findOne({
      _id: userId,
      isActive: { $ne: false },
    })
      .select(
        'username displayName bio avatar coverPhoto location website isVerified isPrivate followersCount followingCount tweetsCount createdAt'
      )
      .lean();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // If profile is private and not the owner, return limited info
    if (user.isPrivate && userId !== currentUserId) {
      return {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
      };
    }

    // Return full profile for public accounts or own profile
    return {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      location: user.location,
      website: user.website,
      isVerified: user.isVerified,
      isPrivate: user.isPrivate,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      tweetsCount: user.tweetsCount,
      createdAt: user.createdAt,
    };
  }

  //  Get all users with pagination and filters
  async getAllUsers(options = {}, currentUserId) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verified = null,
      isPrivate = null,
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
      isActive: { $ne: false },
    };

    // Add filters
    if (verified !== null) {
      query.isVerified = verified === 'true';
    }

    if (isPrivate !== null) {
      query.isPrivate = isPrivate === 'true';
    }

    // Execute query
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('username displayName bio avatar isVerified isPrivate followersCount createdAt')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    };
  }

  // Get suggested users (users not followed by current user)
  async getSuggestedUsers(currentUserId, limit = 10) {
    // This would require Follow model to check who user is already following
    // For now, return random active users excluding current user
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
          isActive: { $ne: false },
          isPrivate: { $ne: true }, // Only suggest public accounts
        },
      },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          username: 1,
          displayName: 1,
          bio: 1,
          avatar: 1,
          isVerified: 1,
          followersCount: 1,
        },
      },
    ]);

    return users;
  }

  //  Get user statistics
  async getUserStats(userId) {
    const user = await User.findOne({
      _id: userId,
      isActive: { $ne: false },
    })
      .select('displayName followersCount followingCount tweetsCount')
      .lean();

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      displayName: user.displayName,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      tweetsCount: user.tweetsCount || 0,
    };
  }
}

export const userService = new UserService();
