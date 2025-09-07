import { User, Follow } from '../models/index.js';
import ApiError from '../utils/api-error.js';
import logger from '../config/logger.config.js';

class FollowService {
  // Follow a user
  async followUser(followerId, followingId) {
    // Prevent self-follow
    if (followerId === followingId.toString()) {
      throw ApiError.badRequest('You cannot follow yourself');
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower) throw ApiError.notFound('Follower user not found');
    if (!following) throw ApiError.notFound('User to follow not found');
    if (!following.isActive) throw ApiError.badRequest('Cannot follow inactive user');

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      throw ApiError.conflict('Already following this user');
    }

    // Always create as accepted (since no private accounts)
    const follow = await Follow.create({
      follower: followerId,
      following: followingId,
    });

    // Update counts
    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: 1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followingId },
          update: { $inc: { followersCount: 1 } },
        },
      },
    ]);

    logger.info(`User ${followerId} followed user ${followingId}`);

    return follow;
  }

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      throw ApiError.notFound('Follow relationship not found');
    }

    // Update counts
    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followingId },
          update: { $inc: { followersCount: -1 } },
        },
      },
    ]);

    logger.info(`User ${followerId} unfollowed user ${followingId}`);

    return follow;
  }

  // Get user's followers
  async getFollowers(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const [followers, total] = await Promise.all([
      Follow.find({ following: userId })
        .populate('follower', 'username displayName avatar isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ following: userId }),
    ]);

    return {
      followers: followers.map((f) => f.follower),
      pagination: { page, limit, total },
    };
  }

  // Get user's following list
  async getFollowing(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const [following, total] = await Promise.all([
      Follow.find({ follower: userId })
        .populate('following', 'username displayName avatar isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ follower: userId }),
    ]);

    return {
      following: following.map((f) => f.following),
      pagination: { page, limit, total },
    };
  }

  // Get follow status
  async getFollowStatus(followerId, followingId) {
    if (followerId.toString() === followingId.toString()) {
      return { status: 'self', relationship: null };
    }

    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      return { status: 'not_following', relationship: null };
    }

    return {
      status: 'accepted',
      relationship: follow,
      isMuted: follow.isMuted,
    };
  }

  // Suggested users to follow
  async getSuggestedUsers(userId, limit = 10) {
    const alreadyFollowing = await Follow.find({ follower: userId }).select('following');

    const followingIds = alreadyFollowing.map((f) => f.following);
    followingIds.push(userId); // Exclude self

    const suggestedUsers = await User.find({
      _id: { $nin: followingIds },
      isActive: true,
    })
      .select('username displayName avatar isVerified followersCount')
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(limit);

    return suggestedUsers;
  }
}

export const followService = new FollowService();
