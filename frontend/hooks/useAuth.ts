import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import { router } from 'expo-router';
import { apiService } from '@/services/api'
// import { socketService } from '@/services/socket';
import { API_ENDPOINTS } from '@/config/api';


interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (formData: FormData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string , confirmPassword: string) => Promise<void>;
  activeSessions: () => Promise<void>;
}

interface SignupData {
  name: string;
  username: string;
  email: string;
  password: string;
}

const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          await fetchUser();
          router.replace('/(tabs)');
         
        }
        else {
          router.replace('/(auth)/login');
        }
        
      } catch (error) {
        console.error('Error loading user:', error);
        await AsyncStorage.multiRemove(['authToken', 'user']);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper function to transform backend user data to frontend format
  const transformUserData = (userData: any): User => {
    return {
      id: userData._id || userData.id || '',
      name: userData.name || userData.displayName || '',
      username: userData.username || '',
      email: userData.email || '',
      bio: userData.bio || '',
      profilePic: userData.profilePic || userData.avatar || '',
      coverPhoto: userData.coverPhoto || '',
      location: userData.location || '',
      website: userData.website || '',
      isVerified: userData.isVerified ?? false,
      isPrivate: userData.isPrivate ?? false,
      role: userData.role || 'user',
      followers: userData.followers || [],
      following: userData.following || [],
      followersCount: userData.followersCount ?? 0,
      followingCount: userData.followingCount ?? 0,
      tweetsCount: userData.tweetsCount ?? 0,
      createdAt: userData.createdAt || new Date().toISOString(),
      lastActiveAt: userData.lastActiveAt || null,
    };
  };

  const fetchUser = async () => {
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.CURRENT_USER);
      
      if (response.success && response.data) {
        // Handle different response structures
        const userData = response.data.user || response.data;
        const transformedUser = transformUserData(userData);
        
        setUser(transformedUser);
        
        // Update AsyncStorage with latest user data
        await AsyncStorage.setItem('user', JSON.stringify(transformedUser));
        
        console.log('User fetched and updated:', transformedUser);
       
        return transformedUser;

      } else {
        // Invalid token or user not found, clear storage
        await AsyncStorage.multiRemove(['authToken', 'user']);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>(API_ENDPOINTS.LOGIN, { identifier: email, password });

      if (response.success && response.data) {
        const { accessToken } = response.data;

        // Save tokens
        await AsyncStorage.multiSet([
          ['authToken', accessToken],
          // ['refreshToken', refreshToken], // if backend provides
        ]);

        // Fetch user data and update state
        await fetchUser();

        // connect socket and navigate
        // await socketService.connect();
        router.replace('/(tabs)');

        console.log('User logged in successfully');
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>(API_ENDPOINTS.REGISTER, userData);
      console.log('Signup data sent:', userData);
      console.log('Signup response:', response);

      if (response.success && response.data) {
        // Transform backend user data to frontend format
        //  Alert.alert('Signup Successful', 'Please log in with your new account.');
        router.replace('/(auth)/login');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with an error status
        console.error('Signup error response:', error.response.data);
      } else if (error.request) {
        // Request made but no response received
        console.error('Signup error request (no response):', error.request);
      } else {
        // Something else happened
        console.error('Signup error message:', error.message);
      }

      throw new Error(error.response?.data?.message || error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint
      await apiService.post(API_ENDPOINTS.LOGOUT_CURRENT);

      // socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken','user']);
      setUser(null);
     
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      // socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken','user']);
      setUser(null);
    
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (formData: FormData) => {
    if (!user) return;
    console.log('formData:', formData);
  
    try {
      const response = await apiService.putForm<any>(API_ENDPOINTS.UPDATE_PROFILE, formData);
      console.log('Update user response:', response);

      if (response.success && response.data) {
        // Instead of manually transforming, fetch fresh data from server
        // This ensures we get the most up-to-date user data
        await fetchUser();
        
        console.log('User profile updated successfully');
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Update failed');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string , confirmPassword: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword
      });
      console.log('Change password request:', { currentPassword, newPassword, confirmPassword });
      console.log('Change password response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const deleteAccount = async (password: string, confirmDelete: string) => {
    try {
      // Call the DELETE API with password in body
      const response = await apiService.delete<any>(API_ENDPOINTS.DELETE_ACCOUNT, { password, confirmDelete });
      console.log('Delete account request:', { password, confirmDelete });
      console.log('Delete account response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete account');
      }

      // If successful, remove stored auth info
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setUser(null);
      
      console.log('Account deletion initiated successfully');
      return true;
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  };

  const activeSessions = async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.ACTIVE_SESSIONS);
     
      if (response.success && response.data) {
        console.log('Active sessions:', response);
        return response;
      }
      return null;
    } catch (error) {
      console.error('Active sessions error:', error);
      return null;
    }
  };

  // Helper function to check auth status without unnecessary API calls
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return false;
      }

      // If we already have a user in state and token exists, we're authenticated
      if (user && user.id) {
        return true;
      }

      // Otherwise, try to fetch user data
      const userData = await fetchUser();
      return userData !== null;
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      return false;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    fetchUser,
    deleteAccount,
    activeSessions,
    checkAuthStatus
  };
});

export { AuthProvider, useAuth };