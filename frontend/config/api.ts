
const API_BASE_URL = 'http://192.168.208.209:3000/api' // Development - Backend server

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  REFRESH_TOKEN: '/auth/refresh-token',
  
  // User
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/upload/image',
  UPLOAD_COVER: '/upload/image',
  FOLLOW: '/users/follow',
  UNFOLLOW: '/users/unfollow',
  FOLLOWERS: '/users',
  FOLLOWING: '/users',
  SEARCH_USERS: '/users/search',
  
  // Tweets
  TWEETS: '/tweets',
  USER_TWEETS: '/tweets/user',
  TWEET_DETAIL: '/tweets',
  CREATE_TWEET: '/tweets',
  LIKE_TWEET: '/tweets',
  RETWEET: '/tweets',
  COMMENT: '/tweets',
  HOME_FEED: '/tweets/feed',
  TRENDING: '/tweets/trending',
  SEARCH_TWEETS: '/tweets/search',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/read',
  MARK_ALL_READ: '/notifications/read-all',
  UNREAD_COUNT: '/notifications/unread-count',
  
  // Messages
  CONVERSATIONS: '/messages/conversations',
  MESSAGES: '/messages',
  SEND_MESSAGE: '/messages',
  MARK_CONVERSATION_READ: '/messages/read',
};

export default API_BASE_URL;