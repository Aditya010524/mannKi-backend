const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Tweet.deleteMany({});
    await Comment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Software developer and tech enthusiast',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=200&fit=crop'
      },
      {
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Designer and creative thinker',
        location: 'New York, NY',
        website: 'https://janesmith.design',
        profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=200&fit=crop'
      },
      {
        name: 'Mike Johnson',
        username: 'mikejohnson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Entrepreneur and startup founder',
        location: 'Austin, TX',
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=200&fit=crop'
      },
      {
        name: 'Sarah Wilson',
        username: 'sarahwilson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Marketing specialist and content creator',
        location: 'Los Angeles, CA',
        profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=200&fit=crop'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Created sample users');

    // Set up following relationships
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      following: [createdUsers[1]._id, createdUsers[2]._id]
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      followers: [createdUsers[0]._id],
      following: [createdUsers[0]._id, createdUsers[3]._id]
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      followers: [createdUsers[0]._id],
      following: [createdUsers[3]._id]
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      followers: [createdUsers[1]._id, createdUsers[2]._id]
    });

    // Create sample tweets
    const tweets = [
      {
        content: 'Just launched my new project! Excited to share it with the world 🚀 #coding #startup',
        author: createdUsers[0]._id,
        hashtags: ['coding', 'startup']
      },
      {
        content: 'Beautiful sunset today! Nature never fails to amaze me 🌅',
        author: createdUsers[1]._id,
        media: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop']
      },
      {
        content: 'Working on some exciting new features. Can\'t wait to show you all! #development #tech',
        author: createdUsers[0]._id,
        hashtags: ['development', 'tech']
      },
      {
        content: 'Coffee and code - the perfect combination ☕️💻 #programming',
        author: createdUsers[2]._id,
        hashtags: ['programming']
      },
      {
        content: 'Great meeting with the team today. Amazing what we can accomplish together! #teamwork',
        author: createdUsers[3]._id,
        hashtags: ['teamwork']
      }
    ];

    const createdTweets = await Tweet.insertMany(tweets);
    console.log('🐦 Created sample tweets');

    // Add some likes and retweets
    await Tweet.findByIdAndUpdate(createdTweets[0]._id, {
      likes: [
        { user: createdUsers[1]._id },
        { user: createdUsers[2]._id }
      ],
      retweets: [
        { user: createdUsers[1]._id }
      ]
    });

    await Tweet.findByIdAndUpdate(createdTweets[1]._id, {
      likes: [
        { user: createdUsers[0]._id },
        { user: createdUsers[3]._id }
      ]
    });

    // Create sample comments
    const comments = [
      {
        content: 'Congratulations! Looking forward to trying it out.',
        author: createdUsers[1]._id,
        tweet: createdTweets[0]._id
      },
      {
        content: 'This looks amazing! Great work 👏',
        author: createdUsers[2]._id,
        tweet: createdTweets[0]._id
      }
    ];

    const createdComments = await Comment.insertMany(comments);
    
    // Add comments to tweets
    await Tweet.findByIdAndUpdate(createdTweets[0]._id, {
      comments: createdComments.map(c => c._id)
    });

    console.log('💬 Created sample comments');
    console.log('✅ Database seeded successfully!');
    
    console.log('\n📋 Sample login credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');
    console.log('Email: sarah@example.com | Password: password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();