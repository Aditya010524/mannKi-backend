
// const API_BASE_URL = 'http://192.168.118.208:5000/api' // Development - Backend server

// export const API_ENDPOINTS = {
//   // Auth
//   LOGIN: '/auth/login',
//   REGISTER: '/auth/register',
//   FORGOT_PASSWORD: '/auth/forgot-password',
//   RESET_PASSWORD: '/auth/reset-password',
//   CHANGE_PASSWORD: '/auth/change-password',
//   REFRESH_TOKEN: '/auth/refresh-token',
  
//   // User
//   PROFILE: '/users/profile',
//   UPDATE_PROFILE: '/users/profile',
//   UPLOAD_AVATAR: '/upload/image',
//   UPLOAD_COVER: '/upload/image',
//   FOLLOW: '/users/follow',
//   UNFOLLOW: '/users/unfollow',
//   FOLLOWERS: '/users',
//   FOLLOWING: '/users',
//   SEARCH_USERS: '/users/search',
  
//   // Tweets
//   TWEETS: '/tweets',
//   USER_TWEETS: '/tweets/user',
//   TWEET_DETAIL: '/tweets',
//   CREATE_TWEET: '/tweets',
//   LIKE_TWEET: '/tweets',
//   RETWEET: '/tweets',
//   COMMENT: '/tweets',
//   HOME_FEED: '/tweets/feed',
//   TRENDING: '/tweets/trending',
//   SEARCH_TWEETS: '/tweets/search',
  
//   // Notifications
//   NOTIFICATIONS: '/notifications',
//   MARK_READ: '/notifications/read',
//   MARK_ALL_READ: '/notifications/read-all',
//   UNREAD_COUNT: '/notifications/unread-count',
  
//   // Messages
//   CONVERSATIONS: '/messages/conversations',
//   MESSAGES: '/messages',
//   SEND_MESSAGE: '/messages',
//   MARK_CONVERSATION_READ: '/messages/read',
// };

// export default API_BASE_URL;

// import axios from 'axios';

// API Configuration
// const API_BASE_URL = 'http://192.168.118.208:5000';
const API_BASE_URL = 'http://192.168.12.208:5000/api/v1';

// API Endpoints - All 17 APIs from Postman
export const API_ENDPOINTS = {
  // Authentication Requests (7)
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User Profile Requests (5)
  CURRENT_USER: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPDATE_USERNAME: '/users/username',
  CHANGE_PASSWORD: '/users/change-password',
  DELETE_ACCOUNT: '/users/me',
  
  // Session Management (4)
  ACTIVE_SESSIONS: '/users/sessions',
  REMOVE_SESSION: '/users/sessions',
  LOGOUT_CURRENT: '/users/logout',
  LOGOUT_ALL: '/users/logout-all',
  
  // Health Check (1)
  HEALTH_STATUS: '/health',



  
//   // User
//   PROFILE: '/users/profile',

//   UPLOAD_AVATAR: '/upload/image',
//   UPLOAD_COVER: '/upload/image',
//   FOLLOW: '/users/follow',
//   UNFOLLOW: '/users/unfollow',
//   FOLLOWERS: '/users',
//   FOLLOWING: '/users',
//   SEARCH_USERS: '/users/search',
  
//   // Tweets
//   TWEETS: '/tweets',
//   USER_TWEETS: '/tweets/user',
//   TWEET_DETAIL: '/tweets',
//   CREATE_TWEET: '/tweets',
//   LIKE_TWEET: '/tweets',
//   RETWEET: '/tweets',
//   COMMENT: '/tweets',
//   HOME_FEED: '/tweets/feed',
//   TRENDING: '/tweets/trending',
//   SEARCH_TWEETS: '/tweets/search',
  
//   // Notifications
//   NOTIFICATIONS: '/notifications',
//   MARK_READ: '/notifications/read',
//   MARK_ALL_READ: '/notifications/read-all',
//   UNREAD_COUNT: '/notifications/unread-count',
  
//   // Messages
//   CONVERSATIONS: '/messages/conversations',
//   MESSAGES: '/messages',
//   SEND_MESSAGE: '/messages',
//   MARK_CONVERSATION_READ: '/messages/read',
};

// Create axios instance
// const apiClient = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export default apiClient;
export default API_BASE_URL;