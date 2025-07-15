  const mongoose = require('mongoose');

  const conversationSchema = new mongoose.Schema({
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true
  });

  // Ensure only 2 participants for direct messages
  conversationSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
      return next(new Error('Conversation must have exactly 2 participants'));
    }
    next();
  });

  // Indexes
  conversationSchema.index({ participants: 1 });
  conversationSchema.index({ lastActivity: -1 });

  // Static method to find or create conversation
  conversationSchema.statics.findOrCreate = async function(user1Id, user2Id) {
    let conversation = await this.findOne({
      participants: { $all: [user1Id, user2Id] }
    }).populate('participants', 'name username profilePic')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await this.create({
        participants: [user1Id, user2Id]
      });
      
      conversation = await this.findById(conversation._id)
        .populate('participants', 'name username profilePic')
        .populate('lastMessage');
    }

    return conversation;
  };

  module.exports = mongoose.model('Conversation', conversationSchema);