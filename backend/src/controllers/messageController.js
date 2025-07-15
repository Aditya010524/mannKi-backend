const { validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name username profilePic')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    // Transform conversations to match frontend format
    const transformedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipant = conversation.participants.find(
          p => p._id.toString() !== req.user.id
        );

        // Get unread message count
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          recipient: req.user.id,
          read: false
        });

        return {
          id: conversation._id,
          participants: conversation.participants.map(p => ({
            id: p._id,
            name: p.name,
            username: p.username,
            profilePic: p.profilePic,
            bio: p.bio || '',
            coverPhoto: p.coverPhoto || '',
            followers: p.followers || [],
            following: p.following || [],
            location: p.location || '',
            website: p.website || '',
            createdAt: p.createdAt || new Date()
          })),
          lastMessage: conversation.lastMessage ? {
            id: conversation.lastMessage._id,
            sender: {
              id: conversation.lastMessage.sender,
              name: otherParticipant?.name || 'Unknown',
              username: otherParticipant?.username || 'unknown',
              profilePic: otherParticipant?.profilePic || '',
              bio: '',
              coverPhoto: '',
              followers: [],
              following: [],
              location: '',
              website: '',
              createdAt: new Date()
            },
            recipient: {
              id: conversation.lastMessage.recipient,
              name: req.user.name,
              username: req.user.username,
              profilePic: req.user.profilePic,
              bio: req.user.bio || '',
              coverPhoto: req.user.coverPhoto || '',
              followers: req.user.followers || [],
              following: req.user.following || [],
              location: req.user.location || '',
              website: req.user.website || '',
              createdAt: req.user.createdAt || new Date()
            },
            content: conversation.lastMessage.content,
            read: conversation.lastMessage.read,
            createdAt: conversation.lastMessage.createdAt
          } : null,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: transformedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username profilePic')
      .populate('recipient', 'name username profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform messages to match frontend format
    const transformedMessages = messages.reverse().map(message => ({
      id: message._id,
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        username: message.sender.username,
        profilePic: message.sender.profilePic,
        bio: message.sender.bio || '',
        coverPhoto: message.sender.coverPhoto || '',
        followers: message.sender.followers || [],
        following: message.sender.following || [],
        location: message.sender.location || '',
        website: message.sender.website || '',
        createdAt: message.sender.createdAt || new Date()
      },
      recipient: {
        id: message.recipient._id,
        name: message.recipient.name,
        username: message.recipient.username,
        profilePic: message.recipient.profilePic,
        bio: message.recipient.bio || '',
        coverPhoto: message.recipient.coverPhoto || '',
        followers: message.recipient.followers || [],
        following: message.recipient.following || [],
        location: message.recipient.location || '',
        website: message.recipient.website || '',
        createdAt: message.recipient.createdAt || new Date()
      },
      content: message.content,
      read: message.read,
      createdAt: message.createdAt
    }));

    res.json({
      success: true,
      data: transformedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(senderId, recipientId);

    // Create message
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      conversation: conversation._id
    });

    await message.populate('sender', 'name username profilePic');
    await message.populate('recipient', 'name username profilePic');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Create notification
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'message',
      message: `${req.user.name} sent you a message`
    });

    // Emit socket events
    if (req.io) {
      // Send to recipient
      req.io.to(recipientId).emit('new_message', {
        id: message._id,
        sender: {
          id: message.sender._id,
          name: message.sender.name,
          username: message.sender.username,
          profilePic: message.sender.profilePic,
          bio: message.sender.bio || '',
          coverPhoto: message.sender.coverPhoto || '',
          followers: message.sender.followers || [],
          following: message.sender.following || [],
          location: message.sender.location || '',
          website: message.sender.website || '',
          createdAt: message.sender.createdAt || new Date()
        },
        recipient: {
          id: message.recipient._id,
          name: message.recipient.name,
          username: message.recipient.username,
          profilePic: message.recipient.profilePic,
          bio: message.recipient.bio || '',
          coverPhoto: message.recipient.coverPhoto || '',
          followers: message.recipient.followers || [],
          following: message.recipient.following || [],
          location: message.recipient.location || '',
          website: message.recipient.website || '',
          createdAt: message.recipient.createdAt || new Date()
        },
        content: message.content,
        read: message.read,
        createdAt: message.createdAt
      });

      // Send notification
      req.io.to(recipientId).emit('new_notification', {
        type: 'message',
        sender: {
          id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          profilePic: req.user.profilePic
        },
        message: `${req.user.name} sent you a message`,
        createdAt: new Date()
      });
    }

    // Transform message to match frontend format
    const transformedMessage = {
      id: message._id,
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        username: message.sender.username,
        profilePic: message.sender.profilePic,
        bio: message.sender.bio || '',
        coverPhoto: message.sender.coverPhoto || '',
        followers: message.sender.followers || [],
        following: message.sender.following || [],
        location: message.sender.location || '',
        website: message.sender.website || '',
        createdAt: message.sender.createdAt || new Date()
      },
      recipient: {
        id: message.recipient._id,
        name: message.recipient.name,
        username: message.recipient.username,
        profilePic: message.recipient.profilePic,
        bio: message.recipient.bio || '',
        coverPhoto: message.recipient.coverPhoto || '',
        followers: message.recipient.followers || [],
        following: message.recipient.following || [],
        location: message.recipient.location || '',
        website: message.recipient.website || '',
        createdAt: message.recipient.createdAt || new Date()
      },
      content: message.content,
      read: message.read,
      createdAt: message.createdAt
    };

    res.status(201).json({
      success: true,
      data: transformedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark conversation as read
// @route   POST /api/messages/read/:conversationId
// @access  Private
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user.id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead
};