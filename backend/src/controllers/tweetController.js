const { validationResult } = require('express-validator');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create tweet
// @route   POST /api/tweets
// @access  Private
const createTweet = async (req, res) => {
  try {
    // Run validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { content } = req.body;
    const author = req.user._id;

    // Uploaded media URLs from Cloudinary
    const mediaUrls = req.files?.map(file => file.path) || [];

    const tweet = await Tweet.create({
      content,
      author,
      media: mediaUrls,
    });

    await tweet.populate('author', 'name username profilePic');

    // Emit socket event
    if (req.io) {
      req.io.emit('new_tweet', tweet);
    }

    res.status(201).json({
      success: true,
      data: tweet,
    });
  } catch (error) {
    console.error('Create tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
// @desc    Get all tweets
// @route   GET /api/tweets
// @access  Public
const getTweets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const tweets = await Tweet.find()
      .populate('author', 'name username profilePic isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name username profilePic'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform tweets to match frontend format
    const transformedTweets = tweets.map(tweet => ({
      id: tweet._id,
      content: tweet.content,
      user: {
        id: tweet.author._id,
        name: tweet.author.name,
        username: tweet.author.username,
        profilePic: tweet.author.profilePic,
        bio: tweet.author.bio || '',
        coverPhoto: tweet.author.coverPhoto || '',
        followers: tweet.author.followers || [],
        following: tweet.author.following || [],
        location: tweet.author.location || '',
        website: tweet.author.website || '',
        createdAt: tweet.author.createdAt || new Date()
      },
      likes: tweet.likes.map(like => like.user.toString()),
      retweets: tweet.retweets.map(retweet => retweet.user.toString()),
      comments: tweet.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.author._id,
          name: comment.author.name,
          username: comment.author.username,
          profilePic: comment.author.profilePic,
          bio: comment.author.bio || '',
          coverPhoto: comment.author.coverPhoto || '',
          followers: comment.author.followers || [],
          following: comment.author.following || [],
          location: comment.author.location || '',
          website: comment.author.website || '',
          createdAt: comment.author.createdAt || new Date()
        },
        createdAt: comment.createdAt,
        likes: comment.likes.map(like => like.user.toString())
      })),
      createdAt: tweet.createdAt,
      media: tweet.media || [],
      mentions: tweet.mentions || [],
      hashtags: tweet.hashtags || []
    }));

    res.json({
      success: true,
      data: transformedTweets
    });
  } catch (error) {
    console.error('Get tweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tweet by ID
// @route   GET /api/tweets/:tweetId
// @access  Public
const getTweetById = async (req, res) => {
  try {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId)
      .populate('author', 'name username profilePic isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name username profilePic'
        }
      });

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Transform tweet to match frontend format
    const transformedTweet = {
      id: tweet._id,
      content: tweet.content,
      user: {
        id: tweet.author._id,
        name: tweet.author.name,
        username: tweet.author.username,
        profilePic: tweet.author.profilePic,
        bio: tweet.author.bio || '',
        coverPhoto: tweet.author.coverPhoto || '',
        followers: tweet.author.followers || [],
        following: tweet.author.following || [],
        location: tweet.author.location || '',
        website: tweet.author.website || '',
        createdAt: tweet.author.createdAt || new Date()
      },
      likes: tweet.likes.map(like => like.user.toString()),
      retweets: tweet.retweets.map(retweet => retweet.user.toString()),
      comments: tweet.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.author._id,
          name: comment.author.name,
          username: comment.author.username,
          profilePic: comment.author.profilePic,
          bio: comment.author.bio || '',
          coverPhoto: comment.author.coverPhoto || '',
          followers: comment.author.followers || [],
          following: comment.author.following || [],
          location: comment.author.location || '',
          website: comment.author.website || '',
          createdAt: comment.author.createdAt || new Date()
        },
        createdAt: comment.createdAt,
        likes: comment.likes.map(like => like.user.toString())
      })),
      createdAt: tweet.createdAt,
      media: tweet.media || [],
      mentions: tweet.mentions || [],
      hashtags: tweet.hashtags || []
    };

    res.json({
      success: true,
      data: transformedTweet
    });
  } catch (error) {
    console.error('Get tweet by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user tweets
// @route   GET /api/tweets/user/:userId
// @access  Public
const getUserTweets = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const tweets = await Tweet.find({ author: userId })
      .populate('author', 'name username profilePic isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name username profilePic'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform tweets to match frontend format
    const transformedTweets = tweets.map(tweet => ({
      id: tweet._id,
      content: tweet.content,
      user: {
        id: tweet.author._id,
        name: tweet.author.name,
        username: tweet.author.username,
        profilePic: tweet.author.profilePic,
        bio: tweet.author.bio || '',
        coverPhoto: tweet.author.coverPhoto || '',
        followers: tweet.author.followers || [],
        following: tweet.author.following || [],
        location: tweet.author.location || '',
        website: tweet.author.website || '',
        createdAt: tweet.author.createdAt || new Date()
      },
      likes: tweet.likes.map(like => like.user.toString()),
      retweets: tweet.retweets.map(retweet => retweet.user.toString()),
      comments: tweet.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.author._id,
          name: comment.author.name,
          username: comment.author.username,
          profilePic: comment.author.profilePic,
          bio: comment.author.bio || '',
          coverPhoto: comment.author.coverPhoto || '',
          followers: comment.author.followers || [],
          following: comment.author.following || [],
          location: comment.author.location || '',
          website: comment.author.website || '',
          createdAt: comment.author.createdAt || new Date()
        },
        createdAt: comment.createdAt,
        likes: comment.likes.map(like => like.user.toString())
      })),
      createdAt: tweet.createdAt,
      media: tweet.media || [],
      mentions: tweet.mentions || [],
      hashtags: tweet.hashtags || []
    }));

    res.json({
      success: true,
      data: transformedTweets
    });
  } catch (error) {
    console.error('Get user tweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get home feed
// @route   GET /api/tweets/feed
// @access  Private
const getHomeFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUser = await User.findById(req.user.id);

    // Get tweets from users the current user follows + their own tweets
    const followingIds = [...currentUser.following, req.user.id];

    const tweets = await Tweet.find({ author: { $in: followingIds } })
      .populate('author', 'name username profilePic isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name username profilePic'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform tweets to match frontend format
    const transformedTweets = tweets.map(tweet => ({
      id: tweet._id,
      content: tweet.content,
      user: {
        id: tweet.author._id,
        name: tweet.author.name,
        username: tweet.author.username,
        profilePic: tweet.author.profilePic,
        bio: tweet.author.bio || '',
        coverPhoto: tweet.author.coverPhoto || '',
        followers: tweet.author.followers || [],
        following: tweet.author.following || [],
        location: tweet.author.location || '',
        website: tweet.author.website || '',
        createdAt: tweet.author.createdAt || new Date()
      },
      likes: tweet.likes.map(like => like.user.toString()),
      retweets: tweet.retweets.map(retweet => retweet.user.toString()),
      comments: tweet.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.author._id,
          name: comment.author.name,
          username: comment.author.username,
          profilePic: comment.author.profilePic,
          bio: comment.author.bio || '',
          coverPhoto: comment.author.coverPhoto || '',
          followers: comment.author.followers || [],
          following: comment.author.following || [],
          location: comment.author.location || '',
          website: comment.author.website || '',
          createdAt: comment.author.createdAt || new Date()
        },
        createdAt: comment.createdAt,
        likes: comment.likes.map(like => like.user.toString())
      })),
      createdAt: tweet.createdAt,
      media: tweet.media || [],
      mentions: tweet.mentions || [],
      hashtags: tweet.hashtags || []
    }));

    res.json({
      success: true,
      data: transformedTweets
    });
  } catch (error) {
    console.error('Get home feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike tweet
// @route   POST /api/tweets/:tweetId/like
// @access  Private
const likeTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.id;

    const tweet = await Tweet.findById(tweetId).populate('author', 'name username');

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    const likeIndex = tweet.likes.findIndex(like => like.user.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      tweet.likes.splice(likeIndex, 1);
    } else {
      // Like
      tweet.likes.push({ user: userId });

      // Create notification if not own tweet
      if (tweet.author._id.toString() !== userId) {
        await Notification.create({
          recipient: tweet.author._id,
          sender: userId,
          type: 'like',
          message: `${req.user.name} liked your tweet`,
          relatedTweet: tweetId
        });

        // Emit socket event
        if (req.io) {
          req.io.to(tweet.author._id.toString()).emit('new_notification', {
            type: 'like',
            sender: {
              id: req.user._id,
              name: req.user.name,
              username: req.user.username,
              profilePic: req.user.profilePic
            },
            message: `${req.user.name} liked your tweet`,
            relatedTweet: tweet,
            createdAt: new Date()
          });
        }
      }
    }

    await tweet.save();

    // Emit real-time update
    if (req.io) {
      req.io.emit('tweet_liked', {
        tweetId,
        userId,
        likesCount: tweet.likes.length,
        liked: likeIndex === -1
      });
    }

    res.json({
      success: true,
      data: {
        tweet,
        liked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Like tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Retweet
// @route   POST /api/tweets/:tweetId/retweet
// @access  Private
const retweetTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.id;

    const tweet = await Tweet.findById(tweetId).populate('author', 'name username');

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    const retweetIndex = tweet.retweets.findIndex(retweet => retweet.user.toString() === userId);

    if (retweetIndex > -1) {
      // Un-retweet
      tweet.retweets.splice(retweetIndex, 1);
    } else {
      // Retweet
      tweet.retweets.push({ user: userId });

      // Create notification if not own tweet
      if (tweet.author._id.toString() !== userId) {
        await Notification.create({
          recipient: tweet.author._id,
          sender: userId,
          type: 'retweet',
          message: `${req.user.name} retweeted your tweet`,
          relatedTweet: tweetId
        });

        // Emit socket event
        if (req.io) {
          req.io.to(tweet.author._id.toString()).emit('new_notification', {
            type: 'retweet',
            sender: {
              id: req.user._id,
              name: req.user.name,
              username: req.user.username,
              profilePic: req.user.profilePic
            },
            message: `${req.user.name} retweeted your tweet`,
            relatedTweet: tweet,
            createdAt: new Date()
          });
        }
      }
    }

    await tweet.save();

    // Emit real-time update
    if (req.io) {
      req.io.emit('tweet_retweeted', {
        tweetId,
        userId,
        retweetsCount: tweet.retweets.length,
        retweeted: retweetIndex === -1
      });
    }

    res.json({
      success: true,
      data: {
        tweet,
        retweeted: retweetIndex === -1
      }
    });
  } catch (error) {
    console.error('Retweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to tweet
// @route   POST /api/tweets/:tweetId/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const tweet = await Tweet.findById(tweetId).populate('author', 'name username');

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    const comment = await Comment.create({
      content,
      author: userId,
      tweet: tweetId
    });

    await comment.populate('author', 'name username profilePic');

    // Add comment to tweet
    tweet.comments.push(comment._id);
    await tweet.save();

    // Create notification if not own tweet
    if (tweet.author._id.toString() !== userId) {
      await Notification.create({
        recipient: tweet.author._id,
        sender: userId,
        type: 'comment',
        message: `${req.user.name} commented on your tweet`,
        relatedTweet: tweetId,
        relatedComment: comment._id
      });

      // Emit socket event
      if (req.io) {
        req.io.to(tweet.author._id.toString()).emit('new_notification', {
          type: 'comment',
          sender: {
            id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            profilePic: req.user.profilePic
          },
          message: `${req.user.name} commented on your tweet`,
          relatedTweet: tweet,
          createdAt: new Date()
        });
      }
    }

    // Emit real-time update
    if (req.io) {
      req.io.emit('tweet_commented', {
        tweetId,
        comment
      });
    }

    // Get updated tweet with comments
    const updatedTweet = await Tweet.findById(tweetId)
      .populate('author', 'name username profilePic isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name username profilePic'
        }
      });

    res.json({
      success: true,
      data: updatedTweet
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search tweets
// @route   GET /api/tweets/search
// @access  Public
const searchTweets = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const tweets = await Tweet.find({
      $or: [
        { content: searchRegex },
        { hashtags: { $in: [q.trim().toLowerCase()] } }
      ]
    })
    .populate('author', 'name username profilePic isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name username profilePic'
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Transform tweets to match frontend format
    const transformedTweets = tweets.map(tweet => ({
      id: tweet._id,
      content: tweet.content,
      user: {
        id: tweet.author._id,
        name: tweet.author.name,
        username: tweet.author.username,
        profilePic: tweet.author.profilePic,
        bio: tweet.author.bio || '',
        coverPhoto: tweet.author.coverPhoto || '',
        followers: tweet.author.followers || [],
        following: tweet.author.following || [],
        location: tweet.author.location || '',
        website: tweet.author.website || '',
        createdAt: tweet.author.createdAt || new Date()
      },
      likes: tweet.likes.map(like => like.user.toString()),
      retweets: tweet.retweets.map(retweet => retweet.user.toString()),
      comments: tweet.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.author._id,
          name: comment.author.name,
          username: comment.author.username,
          profilePic: comment.author.profilePic,
          bio: comment.author.bio || '',
          coverPhoto: comment.author.coverPhoto || '',
          followers: comment.author.followers || [],
          following: comment.author.following || [],
          location: comment.author.location || '',
          website: comment.author.website || '',
          createdAt: comment.author.createdAt || new Date()
        },
        createdAt: comment.createdAt,
        likes: comment.likes.map(like => like.user.toString())
      })),
      createdAt: tweet.createdAt,
      media: tweet.media || [],
      mentions: tweet.mentions || [],
      hashtags: tweet.hashtags || []
    }));

    res.json({
      success: true,
      data: transformedTweets
    });
  } catch (error) {
    console.error('Search tweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get trending hashtags
// @route   GET /api/tweets/trending
// @access  Public
const getTrendingHashtags = async (req, res) => {
  try {
    const trending = await Tweet.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete tweet
// @route   DELETE /api/tweets/:tweetId
// @access  Private
const deleteTweet = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user.id;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Check if user owns the tweet
    if (tweet.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tweet'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ tweet: tweetId });

    // Delete the tweet
    await Tweet.findByIdAndDelete(tweetId);

    res.json({
      success: true,
      message: 'Tweet deleted successfully'
    });
  } catch (error) {
    console.error('Delete tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createTweet,
  getTweets,
  getTweetById,
  getUserTweets,
  getHomeFeed,
  likeTweet,
  retweetTweet,
  addComment,
  searchTweets,
  getTrendingHashtags,
  deleteTweet
};