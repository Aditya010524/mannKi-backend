import { tweetService } from '../services/tweet.service.js';
import { commentService } from '../services/comment.service.js'; // ✅ New service
import { mediaService } from '../services/media.service.js';
import asyncHandler from '../utils/async-handler.js';
import ApiResponse from '../utils/api-response.js';
import ApiError from '../utils/api-error.js';

class TweetController {
  // Create tweet (handles content, media, mentions, hashtags)
  createTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { content, altTexts } = req.body;
    const files = req.files || [];

    if (!content && files.length === 0) {
      throw ApiError.badRequest('Tweet must have content or media');
    }

    let mediaIds = [];
    if (files.length > 0) {
      let parsedAltTexts = [];
      if (altTexts) {
        try {
          parsedAltTexts = Array.isArray(altTexts) ? altTexts : JSON.parse(altTexts);
        } catch (error) {
          parsedAltTexts = [altTexts];
        }
      }

      const mediaResult = await mediaService.uploadMultipleMedia(files, userId, parsedAltTexts);
      mediaIds = mediaResult.media.map((media) => media._id);
    }

    const tweet = await tweetService.createTweet({
      author: userId,
      content: content || '',
      mediaIds,
    });
    return ApiResponse.created(res, tweet, 'Tweet created successfully');
  });

  // Update tweet with media support
  updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const authorId = req.user._id;
    const { content, removeMedia, altTexts } = req.body;
    const files = req.files || [];

    let mediaIds = [];
    if (files.length > 0) {
      let parsedAltTexts = [];
      if (altTexts) {
        try {
          parsedAltTexts = Array.isArray(altTexts) ? altTexts : JSON.parse(altTexts);
        } catch (error) {
          parsedAltTexts = [altTexts];
        }
      }

      const mediaResult = await mediaService.uploadMultipleMedia(files, authorId, parsedAltTexts);
      mediaIds = mediaResult.media.map((media) => media._id);
    }

    const updateData = {
      content,
      mediaIds,
      removeMedia: removeMedia === 'true' || removeMedia === true,
    };

    const tweet = await tweetService.updateTweet(tweetId, authorId, updateData);
    return ApiResponse.success(res, tweet, 'Tweet updated successfully');
  });

  // Home timeline
  getHomeTimeline = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await tweetService.getHomeTimeline(userId, page, limit);
    return ApiResponse.paginated(res, result.tweets, result.pagination, 'Timeline retrieved');
  });

  // Single tweet
  getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const tweet = await tweetService.getTweetById(tweetId);
    return ApiResponse.success(res, tweet, 'Tweet retrieved');
  });

  // Delete tweet
  deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    await tweetService.deleteTweet(tweetId, req.user._id);
    return ApiResponse.deleted(res, 'Tweet deleted');
  });

  // Like/Unlike
  toggleLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const result = await tweetService.toggleLike(tweetId, req.user._id);
    return ApiResponse.success(res, result, 'Like updated');
  });

  // Retweet/Unretweet
  toggleRetweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const result = await tweetService.toggleRetweet(tweetId, userId);

    const message = result.isRetweeted
      ? 'Tweet retweeted successfully'
      : 'Retweet removed successfully';

    return ApiResponse.success(res, result, message);
  });

  // User tweets (Profile tab)
  getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await tweetService.getUserTweets(userId, page, limit);
    return ApiResponse.paginated(res, result.tweets, result.pagination, 'User tweets retrieved');
  });

  // Get user mentions (Notifications tab)
  getUserMentions = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await tweetService.getUserMentions(userId, page, limit);
    return ApiResponse.paginated(res, result.tweets, result.pagination, 'Mentions retrieved');
  });

  //  Get tweets by hashtag (Discovery tab)
  getTweetsByHashtag = asyncHandler(async (req, res) => {
    const { hashtag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await tweetService.getTweetsByHashtag(hashtag, page, limit);
    return ApiResponse.paginated(
      res,
      result.tweets,
      result.pagination,
      `Tweets for #${hashtag} retrieved`
    );
  });

  // ===== NEW COMMENT METHODS =====

  // Get tweet comments
  getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await commentService.getTweetComments(tweetId, page, limit);
    return ApiResponse.paginated(res, result.comments, result.pagination, 'Comments retrieved');
  });

  // Create comment on tweet
  createComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id.toString();
    const { content, altTexts } = req.body;
    const files = req.files || [];

    if (!content && files.length === 0) {
      throw ApiError.badRequest('Comment must have content or media');
    }

    let mediaIds = [];
    if (files.length > 0) {
      let parsedAltTexts = [];
      if (altTexts) {
        try {
          parsedAltTexts = Array.isArray(altTexts) ? altTexts : JSON.parse(altTexts);
        } catch (error) {
          parsedAltTexts = [altTexts];
        }
      }

      const mediaResult = await mediaService.uploadMultipleMedia(files, userId, parsedAltTexts);
      mediaIds = mediaResult.media.map((media) => media._id);
    }

    const comment = await commentService.createComment({
      author: userId,
      tweet: tweetId,
      content: content || '',
      mediaIds,
    });

    return ApiResponse.created(res, comment, 'Comment created successfully');
  });

  // Reply to comment
  createReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    const { content, altTexts } = req.body;
    const files = req.files || [];

    if (!content && files.length === 0) {
      throw ApiError.badRequest('Reply must have content or media');
    }

    let mediaIds = [];
    if (files.length > 0) {
      let parsedAltTexts = [];
      if (altTexts) {
        try {
          parsedAltTexts = Array.isArray(altTexts) ? altTexts : JSON.parse(altTexts);
        } catch (error) {
          parsedAltTexts = [altTexts];
        }
      }

      const mediaResult = await mediaService.uploadMultipleMedia(files, userId, parsedAltTexts);
      mediaIds = mediaResult.media.map((media) => media._id);
    }

    const reply = await commentService.createReply({
      author: userId,
      parentComment: commentId,
      content: content || '',
      mediaIds,
    });

    return ApiResponse.created(res, reply, 'Reply created successfully');
  });

  // Toggle comment like
  toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const result = await commentService.toggleCommentLike(commentId, userId);
    return ApiResponse.success(res, result, 'Comment like updated');
  });

  // Delete comment
  deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    await commentService.deleteComment(commentId, userId);
    return ApiResponse.deleted(res, 'Comment deleted successfully');
  });

  // Get comment replies
  getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const result = await commentService.getCommentReplies(commentId, page, limit);
    return ApiResponse.paginated(res, result.replies, result.pagination, 'Replies retrieved');
  });

  // controllers/tweet.controller.js
  searchTweets = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20, sort = 'latest' } = req.query;

    const result = await tweetService.searchTweets(q, parseInt(page), parseInt(limit), sort);

    return ApiResponse.success(res, result, `Search results for "${q}"`);
  });

  // controllers/tweet.controller.js
  getTrendingTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, timeframe = '24h' } = req.query;

    const hashtags = await tweetService.getTrendingHashtags(
      parseInt(page),
      parseInt(limit),
      timeframe
    );

    return ApiResponse.success(res, hashtags, `Trending hashtags (${timeframe})`);
  });
}

export const tweetController = new TweetController();
