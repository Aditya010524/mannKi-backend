# Twitter Clone - Full Stack Mobile Application

A complete Twitter clone built with React Native (frontend) and Node.js/Express (backend), featuring real-time interactions, messaging, and a comprehensive social media experience.

## 🚀 Features Overview

### 📱 Frontend (React Native + Expo)
- **Cross-platform**: iOS, Android, and Web support
- **Real-time updates**: Socket.IO integration
- **Modern UI**: Clean, Twitter-inspired design
- **Offline support**: AsyncStorage for local data
- **Type-safe**: Full TypeScript implementation

### 🔧 Backend (Node.js + Express)
- **RESTful API**: Complete REST API with proper HTTP methods
- **Real-time features**: Socket.IO for live updates
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based secure authentication
- **File uploads**: Cloudinary integration for media
- **Email service**: Password reset functionality

## 🎯 Complete Feature Set

### 🔐 Authentication System
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Password reset via email
- ✅ Change password functionality
- ✅ Secure logout with token cleanup

### 🏠 Home Feed
- ✅ Timeline with tweets from followed users
- ✅ Real-time tweet updates
- ✅ Pull-to-refresh functionality
- ✅ Infinite scroll pagination
- ✅ Tweet interactions (like, retweet, comment)

### 🔍 Explore & Search
- ✅ Search users by name, username, or bio
- ✅ Search tweets by content and hashtags
- ✅ Trending hashtags display
- ✅ Categorized search results (Top, People, Tweets)
- ✅ Real-time search suggestions

### 🔔 Notifications System
- ✅ Real-time notifications for:
  - New followers
  - Tweet likes and retweets
  - Comments and replies
  - Mentions in tweets
  - Direct messages
- ✅ Unread notification badges
- ✅ Mark as read/unread functionality
- ✅ Notification history

### 💬 Direct Messaging
- ✅ One-to-one conversations
- ✅ Real-time message delivery
- ✅ Message read status
- ✅ Conversation management
- ✅ User search for new conversations
- ✅ Typing indicators

### 👤 Profile Management
- ✅ View and edit profile information
- ✅ Upload profile picture and cover photo
- ✅ Bio, location, and website fields
- ✅ Follower/following statistics
- ✅ Tweet history with tabs (Tweets, Replies, Media, Likes)
- ✅ Follow/unfollow functionality

### ✍️ Tweet Composer
- ✅ Create tweets with text (280 character limit)
- ✅ Image attachments
- ✅ Hashtag support
- ✅ Character counter
- ✅ Draft saving

### 🎨 UI/UX Features
- ✅ Dark/light theme support
- ✅ Haptic feedback (mobile)
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + AsyncStorage
- **Real-time**: Socket.IO client
- **UI**: Custom components with StyleSheet
- **Icons**: Lucide React Native
- **Image Handling**: Expo Image Picker
- **Haptics**: Expo Haptics
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Expo CLI
- iOS Simulator / Android Emulator (for mobile testing)

### 🔧 Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/twitter-clone
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:8081
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```

   Backend will be running on `http://localhost:3000`

### 📱 Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..  # if you're in backend directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

## 🔗 API Integration

The frontend automatically connects to the backend API. Make sure both servers are running:

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:8081`

### Sample Login Credentials (after seeding)
- **Email**: john@example.com | **Password**: password123
- **Email**: jane@example.com | **Password**: password123
- **Email**: mike@example.com | **Password**: password123
- **Email**: sarah@example.com | **Password**: password123

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Key Endpoints

#### Authentication
```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password
POST /api/auth/change-password  # Change password
```

#### Users
```http
GET  /api/users/profile           # Get current user
PUT  /api/users/profile           # Update profile
GET  /api/users/search            # Search users
POST /api/users/follow/:userId    # Follow user
POST /api/users/unfollow/:userId  # Unfollow user
```

#### Tweets
```http
POST /api/tweets                  # Create tweet
GET  /api/tweets/feed            # Get home feed
GET  /api/tweets/search          # Search tweets
POST /api/tweets/:id/like        # Like/unlike tweet
POST /api/tweets/:id/retweet     # Retweet
POST /api/tweets/:id/comment     # Add comment
```

#### Notifications
```http
GET  /api/notifications                    # Get notifications
POST /api/notifications/read/:id          # Mark as read
POST /api/notifications/read-all          # Mark all as read
GET  /api/notifications/unread-count      # Get unread count
```

#### Messages
```http
GET  /api/messages/conversations  # Get conversations
GET  /api/messages/:id           # Get messages
POST /api/messages               # Send message
```

## 🔌 Real-time Features

### Socket.IO Events

**Client receives:**
- `new_tweet` - New tweet created
- `tweet_liked` - Tweet liked/unliked
- `tweet_retweeted` - Tweet retweeted
- `new_notification` - New notification
- `new_message` - New message received
- `user_online/offline` - User status changes

**Client emits:**
- `join_room` - Join conversation room
- `typing_start/stop` - Typing indicators
- `user_online` - Set online status

## 📁 Project Structure

```
twitter-clone/
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── socket/             # Socket.IO handlers
│   │   ├── config/             # Configuration files
│   │   └── utils/              # Utility functions
│   ├── .env.example            # Environment template
│   └── package.json
├── app/                        # React Native screens
│   ├── (auth)/                 # Authentication screens
│   ├── (tabs)/                 # Main tab screens
│   └── _layout.tsx             # Root layout
├── components/                 # Reusable components
├── hooks/                      # Custom React hooks
├── services/                   # API and Socket services
├── types/                      # TypeScript definitions
├── constants/                  # App constants
├── utils/                      # Utility functions
└── README.md
```

## 🚀 Deployment

### Backend Deployment
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS deployment
- **Vercel**: Serverless deployment

### Frontend Deployment
- **Expo EAS Build**: For app store deployment
- **Vercel/Netlify**: For web version
- **GitHub Pages**: Static web deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/twitter-clone
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

### Manual Testing
1. Start both backend and frontend servers
2. Register a new account or use sample credentials
3. Test all features:
   - Create tweets
   - Follow/unfollow users
   - Send messages
   - Check notifications
   - Search functionality

### API Testing
Use Postman, Insomnia, or curl to test API endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

**Frontend:**
- `npm start` - Start Expo development server
- `npm run start-web` - Start with web support
- `npm run start-web-dev` - Start with web and debug mode

### Code Style
- ESLint and Prettier for consistent formatting
- TypeScript for type safety
- RESTful API conventions
- Component-based architecture

## 🛡 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin security
- **Input Validation**: Data sanitization
- **Helmet**: Security headers

## 📈 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **Pagination**: Efficient data loading
- **Image Optimization**: Cloudinary transformations
- **Connection Pooling**: MongoDB optimization
- **Lazy Loading**: Component optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add proper error handling
- Update documentation
- Test your changes

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify environment variables
- Check port availability (3000)

**Frontend can't connect to backend:**
- Ensure backend is running on port 3000
- Check API_BASE_URL in config/api.ts
- Verify CORS settings

**Socket.IO connection issues:**
- Check backend Socket.IO configuration
- Verify authentication token
- Check network connectivity

**Database connection errors:**
- Verify MongoDB URI
- Check database permissions
- Ensure network access (for Atlas)

### Getting Help
- Check console logs for detailed errors
- Verify all environment variables are set
- Test API endpoints individually
- Check database connectivity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for continuous improvements
- MongoDB for the flexible database solution
- Socket.IO for real-time capabilities
- Cloudinary for image management
- All open-source contributors

---

**Ready to build the next big social platform? Let's get started! 🚀**

### Quick Start Commands
```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed
npm run dev

# Terminal 2 - Frontend
npm install
npm start
# Press 'w' for web or scan QR for mobile
```

Happy coding! 🎉