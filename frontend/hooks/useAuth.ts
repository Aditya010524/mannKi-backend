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
          const response = await apiService.get<User>(API_ENDPOINTS.CURRENT_USER);

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
            // await socketService.connect();

          } else {
            // Invalid token, clear storage
            await AsyncStorage.multiRemove(['authToken']);
          }

        }
      } catch (error) {
        console.error('Error loading user:', error);
        await AsyncStorage.multiRemove(['authToken']);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const fetchUser = async () => {

    const response = await apiService.get<User>(API_ENDPOINTS.CURRENT_USER);
    await AsyncStorage.multiRemove(['user']);

    if (response.success && response.data) {

      // Transform backend user data to frontend format
      const userData = response.data.user as any;
      const transformedUser: User = {
        id: userData.id || '',
        name: userData.displayName || '',
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        profilePic: userData.avatar || '',
        coverPhoto: userData.coverPhoto || '',
        location: userData.location || '',
        website: userData.website || '',
        isVerified: userData.isVerified ?? false,
        isPrivate: userData.isPrivate ?? false,
        role: userData.role || 'user',

        // Keep var names same on left side
        followers: userData.followers || [],            // ✅ always array
        following: userData.following || [],            // ✅ always array
        followersCount: userData.followersCount ?? 0,   // ✅ count from backend
        followingCount: userData.followingCount ?? 0,
        tweetsCount: userData.tweetsCount ?? 0,

        createdAt: userData.createdAt || new Date().toISOString(),
        lastActiveAt: userData.lastActiveAt || null,
      };

      setUser(transformedUser);
      console.log('User fetched:', transformedUser);
    }
  }

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

        // ✅ fetch user from your separate function
        await fetchUser();

        // connect socket and navigate
        // await socketService.connect();
        router.replace('/(tabs)');

        console.log('User logged in');
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
      await apiService.post(API_ENDPOINTS.LOGOUT);

      // socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken','user']);
     
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      // socketService.disconnect();
      await AsyncStorage.multiRemove(['authToken','user']);
    
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
      ;

      if (response.success && response.data) {
        // Transform backend user data to frontend format
        const updatedUserData = response.data;
        const transformedUser: User = {
          id: updatedUserData._id || updatedUserData.id,
          name: updatedUserData.displayName,
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
        AsyncStorage.removeItem('user');
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

  const changePassword = async (currentPassword: string, newPassword: string , confirmPassword: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword
      });
      console.log('Change password response:', currentPassword , newPassword , confirmPassword);
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
      const response = await apiService.delete<any>(API_ENDPOINTS.DELETE_ACCOUNT, { password , confirmDelete});
      console.log(password,confirmDelete)
console.log(response)
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete account');
      }

      // If successful, remove stored auth info
      await AsyncStorage.multiRemove(['authToken', 'user']);
      
      console.log('Account deletion initiated successfully');
      return true;
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  };

  const activeSessions = async()=>{
    try {
      const response = await apiService.get(API_ENDPOINTS.ACTIVE_SESSIONS);
     
    if (response.success && response.data) {
      console.log('sessions 22',response);
const sessions = response
     return sessions;

    }
    } catch (error) {
      console.log(error)
    }
  }
 

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
    activeSessions
    
  };
});

export { AuthProvider, useAuth };