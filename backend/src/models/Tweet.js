const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Tweet content is required'],
    maxlength: [280, 'Tweet cannot exceed 280 characters'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    type: String, // URLs to images/videos
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(v);
      },
      message: 'Invalid media URL format'
    }
  }],
  hashtags: [{
    type: String,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Hashtags can only contain letters, numbers, and underscores']
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  retweets: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isRetweet: {
    type: Boolean,
    default: false
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  retweetComment: {
    type: String,
    maxlength: [280, 'Retweet comment cannot exceed 280 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ hashtags: 1 });
tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ 'likes.user': 1 });
tweetSchema.index({ 'retweets.user': 1 });

// Virtual for like count
tweetSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for retweet count
tweetSchema.virtual('retweetCount').get(function() {
  return this.retweets.length;
});

// Virtual for comment count
tweetSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Extract hashtags and mentions before saving
tweetSchema.pre('save', function(next) {
  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  while ((match = hashtagRegex.exec(this.content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  this.hashtags = [...new Set(hashtags)]; // Remove duplicates
  
  next();
});

// Ensure virtual fields are serialized
tweetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tweet', tweetSchema);