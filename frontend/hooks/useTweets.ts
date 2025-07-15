import { useState, useEffect } from 'react';
import { Tweet } from '@/types';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from './useAuth';

export const useTweets = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time listeners
    if (socketService.connected) {
      socketService.onNewTweet((tweet) => {
        // Handle new tweet in real-time
        console.log('New tweet received:', tweet);
      });

      socketService.onTweetLiked((data) => {
        // Handle tweet liked in real-time
        console.log('Tweet liked:', data);
      });

      socketService.onTweetRetweeted((data) => {
        // Handle tweet retweeted in real-time
        console.log('Tweet retweeted:', data);
      });

      socketService.onTweetCommented((data) => {
        // Handle tweet commented in real-time
        console.log('Tweet commented:', data);
      });
    }

    return () => {
      // Clean up listeners
      socketService.off('new_tweet');
      socketService.off('tweet_liked');
      socketService.off('tweet_retweeted');
      socketService.off('tweet_commented');
    };
  }, []);

  const fetchHomeTweets = async (page = 1, limit = 20) => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(API_ENDPOINTS.HOME_FEED, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch tweets');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tweets';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTweets = async (userId: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.USER_TWEETS}/${userId}`, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch user tweets');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user tweets';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTweetById = async (tweetId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet>(`${API_ENDPOINTS.TWEET_DETAIL}/${tweetId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch tweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tweet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const likeTweet = async (tweetId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<{
        tweet: Tweet;
        liked: boolean;
      }>(`${API_ENDPOINTS.LIKE_TWEET}/${tweetId}`);
      
      if (response.success && response.data) {
        return response.data.tweet;
      } else {
        throw new Error(response.error || 'Failed to like tweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like tweet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const retweet = async (tweetId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<{
        tweet: Tweet;
        retweeted: boolean;
      }>(`${API_ENDPOINTS.RETWEET}/${tweetId}`);
      
      if (response.success && response.data) {
        return response.data.tweet;
      } else {
        throw new Error(response.error || 'Failed to retweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retweet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (tweetId: string, content: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<Tweet>(`${API_ENDPOINTS.COMMENT}/${tweetId}`, {
        content,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to add comment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createTweet = async (content: string, media?: string[]) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<Tweet>(API_ENDPOINTS.CREATE_TWEET, {
        content,
        media,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create tweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tweet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchTweets = async (query: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(API_ENDPOINTS.SEARCH_TWEETS, {
        q: query,
        page,
        limit,
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to search tweets');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search tweets';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingHashtags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<{ tag: string; count: number }[]>(API_ENDPOINTS.TRENDING);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch trending hashtags');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending hashtags';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchHomeTweets,
    fetchUserTweets,
    fetchTweetById,
    likeTweet,
    retweet,
    addComment,
    createTweet,
    searchTweets,
    getTrendingHashtags,
  };
};