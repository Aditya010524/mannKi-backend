import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import { router } from 'expo-router';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import { API_ENDPOINTS } from '@/config/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await apiService.get<User>(API_ENDPOINTS.PROFILE);
          if (response.success && response.data) {
            // Transform backend user data to frontend format
            const userData = response.data as any;
            const transformedUser: User = {
              id: userData._id || userData.id,
              name: userData.name,
              username: userData.username,
              bio: userData.bio || '',
              profilePic: userData.profilePic,
              coverPhoto: userData.coverPhoto,
              followers: userData.followers || [],
              following: userData.following || [],
              location: userData.location || '',
              website: userData.website || '',
              createdAt: userData.createdAt || new Date().toISOString(),
            };
            setUser(transformedUser);
            await socketService.connect();
          } else {
            // Invalid token, clear storage
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>(API_ENDPOINTS.LOGIN, { email, password });
      
      if (response.success && response.data) {
        const { user: userData, token, refreshToken } = response.data;
        
        // Transform backend user data to frontend format
        const transformedUser: User = {
          id: userData._id || userData.id,
          name: userData.name,
          username: userData.username,
          bio: userData.bio || '',
          profilePic: userData.profilePic,
          coverPhoto: userData.coverPhoto,
          followers: userData.followers || [],
          following: userData.following || [],
          location: userData.location || '',
          website: userData.website || '',
          createdAt: userData.createdAt || new Date().toISOString(),
        };
        
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(transformedUser)],
        ]);
        
        setUser(transformedUser);
        await socketService.connect();
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message || 'Login failed');
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
      
      if (response.success && response.data) {
        const { user: newUserData, token, refreshToken } = response.data;
        
        // Transform backend user data to frontend format
        const transformedUser: User = {
          id: newUserData._id || newUserData.id,
          name: newUserData.name,
          username: newUserData.username,
          bio: newUserData.bio || '',
          profilePic: newUserData.profilePic,
          coverPhoto: newUserData.coverPhoto,
          followers: newUserData.followers || [],
          following: newUserData.following || [],
          location: newUserData.location || '',
          website: newUserData.website || '',
          createdAt: newUserData.createdAt || new Date().toISOString(),
        };
        
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(transformedUser)],
        ]);
        
        setUser(transformedUser);
        await socketService.connect();
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint
      await apiService.post(API_ENDPOINTS.LOGOUT);
      
      socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      setUser(null);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const response = await apiService.put<any>(API_ENDPOINTS.UPDATE_PROFILE, userData);
      
      if (response.success && response.data) {
        // Transform backend user data to frontend format
        const updatedUserData = response.data;
        const transformedUser: User = {
          id: updatedUserData._id || updatedUserData.id,
          name: updatedUserData.name,
          username: updatedUserData.username,
          bio: updatedUserData.bio || '',
          profilePic: updatedUserData.profilePic,
          coverPhoto: updatedUserData.coverPhoto,
          followers: updatedUserData.followers || [],
          following: updatedUserData.following || [],
          location: updatedUserData.location || '',
          website: updatedUserData.website || '',
          createdAt: updatedUserData.createdAt || new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(transformedUser));
        setUser(transformedUser);
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
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
  };
});

export { AuthProvider, useAuth };