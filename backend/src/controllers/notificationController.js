const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name username profilePic')
      .populate('relatedTweet', 'content')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform notifications to match frontend format
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id,
      type: notification.type,
      sender: {
        id: notification.sender._id,
        name: notification.sender.name,
        username: notification.sender.username,
        profilePic: notification.sender.profilePic,
        bio: notification.sender.bio || '',
        coverPhoto: notification.sender.coverPhoto || '',
        followers: notification.sender.followers || [],
        following: notification.sender.following || [],
        location: notification.sender.location || '',
        website: notification.sender.website || '',
        createdAt: notification.sender.createdAt || new Date()
      },
      recipient: notification.recipient,
      relatedTweet: notification.relatedTweet ? {
        id: notification.relatedTweet._id,
        content: notification.relatedTweet.content,
        user: notification.sender, // Simplified for notification context
        likes: [],
        retweets: [],
        comments: [],
        createdAt: notification.relatedTweet.createdAt || new Date(),
        media: [],
        mentions: [],
        hashtags: []
      } : null,
      read: notification.read,
      createdAt: notification.createdAt
    }));

    res.json({
      success: true,
      data: transformedNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/read/:notificationId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Emit socket event
    if (req.io) {
      req.io.to(req.user.id).emit('notification_read', notificationId);
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};