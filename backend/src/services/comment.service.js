import { User, Comment, CommentLike, Tweet, Media } from '../models/index.js';
import { cloudinary } from '../config/media-upload.config.js';
import ApiError from '../utils/api-error.js';
import logger from '../config/logger.config.js';

class CommentService {
  // Create comment on tweet
  async createComment({ author, tweet, content, mediaIds = [] }) {
    // Verify tweet exists
    const tweetExists = await Tweet.findOne({ _id: tweet, isActive: true });
    if (!tweetExists) {
      throw ApiError.notFound('Tweet not found');
    }

    // Validate media
    if (mediaIds.length > 0) {
      const mediaCount = await Media.countDocuments({
        _id: { $in: mediaIds },
        owner: author,
        isActive: true,
        status: 'ready',
      });

      if (mediaCount !== mediaIds.length) {
        throw ApiError.badRequest('Invalid media IDs provided');
      }
    }

    // Extract mentions and hashtags
    const mentions = await this.extractMentions(content);
    const hashtags = this.extractHashtags(content);

    const comment = await Comment.create({
      author,
      tweet,
      content,
      mediaIds,
      mentions,
      hashtags,
    });

    // Mark media as used
    if (mediaIds.length > 0) {
      await Media.updateMany(
        { _id: { $in: mediaIds } },
        { $set: { isUsed: true, tweet: null, comment: comment._id } }
      );
    }

    // Update tweet's comment count
    await Tweet.findByIdAndUpdate(tweet, { $inc: { commentsCount: 1 } });

    logger.info(`Comment created by user ${author} on tweet ${tweet}: ${comment._id}`);
    return this.getCommentById(comment._id);
  }

  // Create reply to comment
  async createReply({ author, parentComment, content, mediaIds = [] }) {
    // Verify parent comment exists
    const parentCommentExists = await Comment.findOne({ _id: parentComment, isActive: true });
    if (!parentCommentExists) {
      throw ApiError.notFound('Parent comment not found');
    }

    // Validate media
    if (mediaIds.length > 0) {
      const mediaCount = await Media.countDocuments({
        _id: { $in: mediaIds },
        owner: author,
        isActive: true,
        status: 'ready',
      });

      if (mediaCount !== mediaIds.length) {
        throw ApiError.badRequest('Invalid media IDs provided');
      }
    }

    const mentions = await this.extractMentions(content);
    const hashtags = this.extractHashtags(content);

    const reply = await Comment.create({
      author,
      tweet: parentCommentExists.tweet,
      parentComment,
      content,
      mediaIds,
      mentions,
      hashtags,
    });

    // Mark media as used
    if (mediaIds.length > 0) {
      await Media.updateMany(
        { _id: { $in: mediaIds } },
        { $set: { isUsed: true, tweet: null, comment: reply._id } }
      );
    }

    // Update parent comment's reply count
    await Comment.findByIdAndUpdate(parentComment, { $inc: { repliesCount: 1 } });

    // Update tweet's comment count
    await Tweet.findByIdAndUpdate(parentCommentExists.tweet, { $inc: { commentsCount: 1 } });

    logger.info(`Reply created by user ${author} to comment ${parentComment}: ${reply._id}`);
    return this.getCommentById(reply._id);
  }

  // Get single comment
  async getCommentById(commentId) {
    const comment = await Comment.findOne({ _id: commentId, isActive: true })
      .populate('author', 'username displayName avatar isVerified')
      .populate('mentions', 'username displayName')
      .populate('mediaIds', 'type cloudinary.urls originalName altText size');

    if (!comment) throw ApiError.notFound('Comment not found');

    return this.formatComment(comment);
  }

  // Get tweet comments
  async getTweetComments(tweetId, page, limit) {
    const tweet = await Tweet.findOne({ _id: tweetId, isActive: true });
    if (!tweet) {
      throw ApiError.notFound('Tweet not found or has been deleted');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({
        tweet: tweetId,
        parentComment: null, // Only top-level comments
        isActive: true, // Only active comments
      })
        .populate('author', 'username displayName avatar isVerified')
        // .populate('mentions', 'username displayName')
        // .populate('mediaIds', 'type cloudinary.urls originalName altText')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({
        tweet: tweetId,
        parentComment: null,
        isActive: true,
      }),
    ]);

    return {
      comments: comments.map(this.formatComment),
      pagination: { page, limit, total },
    };
  }

  // Get comment replies
  async getCommentReplies(commentId, page, limit) {
    // Check if parent comment is active
    const parentComment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!parentComment) {
      throw ApiError.notFound('Comment not found or has been deleted');
    }

    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      Comment.find({
        parentComment: commentId,
        isActive: true, // ✅ FIX: Only get active replies
      })
        .populate('author', 'username displayName avatar isVerified')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({
        parentComment: commentId,
        isActive: true,
      }),
    ]);

    return { replies: replies.map(this.formatComment), pagination: { page, limit, total } };
  }

  // Toggle comment like
  async toggleCommentLike(commentId, userId) {
    // ✅ FIX: Check if comment is active
    const comment = await Comment.findOne({ _id: commentId, isActive: true });
    if (!comment) {
      throw ApiError.notFound('Comment not found or has been deleted');
    }

    const existingLike = await CommentLike.findOne({ comment: commentId, user: userId });

    if (existingLike) {
      await CommentLike.findByIdAndDelete(existingLike._id);
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
      return { liked: false };
    } else {
      await CommentLike.create({ comment: commentId, user: userId });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });
      return { liked: true };
    }
  }

  // Delete comment
  async deleteComment(commentId, userId) {
    const comment = await Comment.findOne({ _id: commentId, isActive: true });

    if (!comment) {
      throw ApiError.notFound('Comment not found or already deleted');
    }

    if (!comment.author.equals(userId)) {
      throw ApiError.forbidden('Cannot delete comment');
    }

    // ✅ FIX: Soft delete all replies to this comment
    await Comment.updateMany({ parentComment: commentId, isActive: true }, { isActive: false });

    // Delete media
    for (const media of comment.mediaIds) {
      try {
        await cloudinary.uploader.destroy(media.cloudinary.publicId);
        await Media.findByIdAndDelete(media._id);
      } catch (error) {
        logger.error(`Failed to delete media ${media._id}: ${error.message}`);
      }
    }

    // Soft delete comment
    await Comment.findByIdAndUpdate(commentId, { isActive: false });

    // Update counts
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }
    await Tweet.findByIdAndUpdate(comment.tweet, { $inc: { commentsCount: -1 } });

    logger.info(`Comment ${commentId} and its replies deleted by user ${userId}`);
  }

  // services/tweet.service.js
  async searchTweets(query, page, limit, sort = 'latest') {
    const skip = (page - 1) * limit;

    const searchQuery = {
      isActive: true,
      type: 'original',
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $in: [query.toLowerCase()] } },
      ],
    };

    let sortQuery;
    switch (sort) {
      case 'popular':
        sortQuery = { engagementScore: -1, createdAt: -1 };
        break;
      case 'latest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [tweets, total] = await Promise.all([
      Tweet.find(searchQuery)
        .populate('author', 'username displayName avatar isVerified')
        .populate('mentions', 'username displayName')
        .populate('mediaIds', 'type cloudinary.urls originalName altText')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Tweet.countDocuments(searchQuery),
    ]);

    return {
      tweets: tweets.map(this.formatTweet),
      pagination: { page, limit, total },
    };
  }

  // Helper: Extract mentions
  async extractMentions(content) {
    if (!content) return [];

    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1].toLowerCase());
    }

    if (mentions.length === 0) return [];

    const users = await User.find({
      username: { $in: mentions },
      isActive: true,
    }).select('_id');

    return users.map((user) => user._id);
  }

  // Helper: Extract hashtags
  extractHashtags(content) {
    if (!content) return [];

    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    return [...new Set(hashtags)];
  }

  // Helper: Format comment response
  formatComment(comment) {
    return {
      id: comment._id,
      content: comment.content,
      author: comment.author,
      mentions: comment.mentions || [],
      hashtags: comment.hashtags || [],
      media:
        comment.mediaIds?.map((m) => ({
          id: m._id,
          type: m.type,
          url: m.cloudinary.urls.original,
          thumbnail: m.cloudinary.urls.thumbnail,
          name: m.originalName,
          altText: m.altText,
        })) || [],
      stats: {
        likes: comment.likesCount,
        replies: comment.repliesCount,
      },
      postId: comment.tweet,
      parentComment: comment.parentComment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}

export const commentService = new CommentService();
