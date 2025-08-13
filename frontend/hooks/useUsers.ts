import { useState } from 'react';
import { User } from '@/types';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from './useAuth';

export const useUsers = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<User[]>(API_ENDPOINTS.SEARCH_USERS, {
        q: query,
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to search users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUserByUsername = async (username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<User>(`${API_ENDPOINTS.PROFILE}/${username}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'User not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

const followUser = async (userId: string) => {
  if (!currentUser) return false;

  setIsLoading(true);
  setError(null);

  try {
    const response = await apiService.post(`${API_ENDPOINTS.FOLLOW}/${userId}`);

    if (response.success) {
      // Create FormData with updated following list
      const formData = new FormData();
      const updatedFollowing = [...currentUser.following, userId];
      formData.append('following', JSON.stringify(updatedFollowing));

      await updateUser(formData);
      return true;
    } else {
      throw new Error(response.error || 'Failed to follow user');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to follow user';
    setError(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};


  const unfollowUser = async (userId: string) => {
  if (!currentUser) return false;

  setIsLoading(true);
  setError(null);

  try {
    const response = await apiService.post(`${API_ENDPOINTS.UNFOLLOW}/${userId}`);

    if (response.success) {
      // Construct FormData to send updated following list
      const updatedFollowing = currentUser.following.filter(id => id !== userId);
      const formData = new FormData();
      formData.append('following', JSON.stringify(updatedFollowing));

      // Call updateUser with FormData
      await updateUser(formData);

      return true;
    } else {
      throw new Error(response.error || 'Failed to unfollow user');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to unfollow user';
    setError(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};


  const getFollowers = async (userId: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<User[]>(`${API_ENDPOINTS.FOLLOWERS}/${userId}`, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch followers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch followers';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowing = async (userId: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<User[]>(`${API_ENDPOINTS.FOLLOWING}/${userId}`, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch following');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch following';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const file = {
        uri: imageUri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      };

      const response = await apiService.uploadFile<{ url: string }>(
        API_ENDPOINTS.UPLOAD_AVATAR,
        file
      );
      
      if (response.success && response.data) {
        await updateUser({
          profilePic: response.data.url,
        });
        return response.data.url;
      } else {
        throw new Error(response.error || 'Failed to upload avatar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCover = async (imageUri: string) => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const file = {
        uri: imageUri,
        name: 'cover.jpg',
        type: 'image/jpeg',
      };

      const response = await apiService.uploadFile<{ url: string }>(
        API_ENDPOINTS.UPLOAD_COVER,
        file
      );
      
      if (response.success && response.data) {
        await updateUser({
          coverPhoto: response.data.url,
        });
        return response.data.url;
      } else {
        throw new Error(response.error || 'Failed to upload cover photo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload cover photo';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    searchUsers,
    getUserByUsername,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    uploadAvatar,
    uploadCover,
  };
};