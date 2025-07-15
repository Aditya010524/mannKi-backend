# Twitter Clone Backend

A full-featured Node.js/Express.js backend API for the Twitter Clone mobile application with real-time features using Socket.IO.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User registration and login
- Password reset functionality
- Secure password hashing with bcrypt
- Token refresh mechanism

### 👥 User Management
- User profiles with customizable information
- Follow/unfollow functionality
- User search capabilities
- Profile picture and cover photo uploads

### 🐦 Tweet System
- Create, read, and delete tweets
- Like and unlike tweets
- Retweet functionality
- Comment system with nested replies
- Hashtag support and trending topics
- Media attachments (images)

### 🔔 Real-time Notifications
- Socket.IO integration for real-time updates
- Notifications for likes, retweets, comments, follows
- Unread notification tracking
- Real-time tweet updates

### 💬 Messaging System
- Direct messaging between users
- Real-time message delivery
- Conversation management
- Message read status tracking

### 📁 File Upload
- Cloudinary integration for image uploads
- Profile picture and cover photo management
- Media attachments for tweets

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service (Gmail recommended)

### 1. Clone and Install
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/twitter-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8081
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

### 4. Cloudinary Setup (Optional)
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Update environment variables

### 5. Email Setup (Optional)
For password reset functionality:
1. Use Gmail with App Password
2. Enable 2-factor authentication
3. Generate App Password
4. Update `EMAIL_USER` and `EMAIL_PASS`

### 6. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 7. Seed Sample Data (Optional)
```bash
npm run seed
```

This creates sample users and tweets for testing.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### User Endpoints

#### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Updated bio",
  "location": "New Location"
}
```

#### Search Users
```http
GET /api/users/search?q=john&page=1&limit=20
```

#### Follow User
```http
POST /api/users/follow/:userId
Authorization: Bearer <token>
```

### Tweet Endpoints

#### Create Tweet
```http
POST /api/tweets
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello world! #firsttweet",
  "media": ["https://example.com/image.jpg"]
}
```

#### Get Home Feed
```http
GET /api/tweets/feed?page=1&limit=20
Authorization: Bearer <token>
```

#### Like Tweet
```http
POST /api/tweets/:tweetId/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/tweets/:tweetId/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great tweet!"
}
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>
```

#### Mark as Read
```http
POST /api/notifications/read/:notificationId
Authorization: Bearer <token>
```

### Message Endpoints

#### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id_here",
  "content": "Hello there!"
}
```

## 🔌 Socket.IO Events

### Client to Server Events
- `join_room` - Join a conversation room
- `leave_room` - Leave a conversation room
- `send_message` - Send a message (handled via HTTP API)
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server to Client Events
- `new_tweet` - New tweet created
- `tweet_liked` - Tweet was liked/unliked
- `tweet_retweeted` - Tweet was retweeted
- `new_notification` - New notification received
- `new_message` - New message received
- `user_online` - User came online
- `user_offline` - User went offline

## 🗂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── tweetController.js   # Tweet operations
│   │   ├── notificationController.js
│   │   ├── messageController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Tweet.js             # Tweet schema
│   │   ├── Comment.js           # Comment schema
│   │   ├── Notification.js      # Notification schema
│   │   ├── Message.js           # Message schema
│   │   └── Conversation.js      # Conversation schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── users.js             # User routes
│   │   ├── tweets.js            # Tweet routes
│   │   ├── notifications.js     # Notification routes
│   │   ├── messages.js          # Message routes
│   │   └── upload.js            # Upload routes
│   ├── socket/
│   │   └── socketHandler.js     # Socket.IO logic
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── utils/
│   │   └── sendEmail.js         # Email utility
│   └── server.js                # Main server file
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## 🧪 Testing

### Sample Login Credentials (after seeding)
- **Email**: john@example.com | **Password**: password123
- **Email**: jane@example.com | **Password**: password123
- **Email**: mike@example.com | **Password**: password123
- **Email**: sarah@example.com | **Password**: password123

### API Testing
Use tools like Postman, Insomnia, or curl to test the API endpoints.

### Health Check
```http
GET /api/health
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/twitter-clone
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS deployment
- **AWS/GCP**: Cloud deployment

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests (when implemented)

### Code Style
- Use ESLint and Prettier for consistent code formatting
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling

## 🛡 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **JWT**: Secure authentication
- **Password Hashing**: bcrypt encryption
- **Input Validation**: Express validator
- **MongoDB Injection Protection**: Mongoose sanitization

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Caching**: Redis integration ready
- **File Compression**: Gzip compression
- **Connection Pooling**: MongoDB connection optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string
- Check network connectivity

#### JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header format

#### Socket.IO Connection Issues
- Check CORS configuration
- Verify frontend URL in environment
- Check firewall settings

#### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file types

### Getting Help
- Check the logs for detailed error messages
- Verify all environment variables are set
- Test API endpoints individually
- Check database connectivity

---

**Happy coding! 🚀**