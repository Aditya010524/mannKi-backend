
const API_BASE_URL = 'http://192.168.207.208:5000/api/v1';


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
  SEARCH_USERS: "/users/search",   // 🔍 Search user by query
  GET_ALL_USERS: "/users",         // 👥 Get all users
  GET_USER_BY_ID: "/users",        // 🆔 Get user by ID (append /:id)
  GET_USER_STATS: "/users",        // 📊 Get user stats (append /:id/stats)   


  
  FOLLOW: "/follows",                // POST /follows/:userId
  UNFOLLOW: "/follows",              // DELETE /follows/:userId
  TOGGLE_FOLLOW: "/follows",         // PATCH /follows/:userId
  GET_FOLLOWERS: "/follows",         // GET /follows/:userId/followers
  GET_FOLLOWING: "/follows",         // GET /follows/:userId/following
  CHECK_FOLLOW_STATUS: "/follows",   // GET /follows/:userId/status
  SUGGESTED_USERS: "/follows/suggestions", // GET



  // Session Management (4)
  ACTIVE_SESSIONS: '/users/sessions',
  REMOVE_SESSION: '/users/sessions',
  LOGOUT_CURRENT: '/users/logout',
  LOGOUT_ALL: '/users/logout-all',
  
  // Health Check (1)
  HEALTH_STATUS: '/health',



}
export default API_BASE_URL;