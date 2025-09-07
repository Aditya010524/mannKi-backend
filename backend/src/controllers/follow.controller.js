import { followService } from '../services/follow.service.js';
import asyncHandler from '../utils/async-handler.js';
import ApiResponse from '../utils/api-response.js';

class FollowController {
  // Follow a user
  followUser = asyncHandler(async (req, res) => {
    const followerId = req.user._id.toString();
    const followingId = req.params.userId;

    const follow = await followService.followUser(followerId, followingId);

    return ApiResponse.created(res, { followId: follow._id }, 'Successfully followed user');
  });

  //  Unfollow a user
  unfollowUser = asyncHandler(async (req, res) => {
    const followerId = req.user._id.toString();
    const followingId = req.params.userId;

    await followService.unfollowUser(followerId, followingId);

    return ApiResponse.deleted(res, 'Successfully unfollowed user');
  });

  // Get user's followers
  getFollowers = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await followService.getFollowers(userId, page, limit);

    return ApiResponse.paginated(
      res,
      result.followers,
      result.pagination,
      'Followers retrieved successfully'
    );
  });

  // Get user's following list
  getFollowing = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await followService.getFollowing(userId, page, limit);

    return ApiResponse.paginated(
      res,
      result.following,
      result.pagination,
      'Following list retrieved successfully'
    );
  });

  //  Check follow status between two users
  getFollowStatus = asyncHandler(async (req, res) => {
    const followerId = req.user._id.toString();
    const followingId = req.params.userId;

    const status = await followService.getFollowStatus(followerId, followingId);

    return ApiResponse.success(res, status, 'Follow status retrieved successfully');
  });

  //  Get suggested users to follow
  getSuggestedUsers = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const limit = parseInt(req.query.limit) || 10;

    const suggestedUsers = await followService.getSuggestedUsers(userId, limit);

    return ApiResponse.success(res, suggestedUsers, 'Suggested users retrieved successfully');
  });
}

export const followController = new FollowController();
