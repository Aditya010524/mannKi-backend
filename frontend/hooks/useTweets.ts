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
              console.log("Home tweets fetched", );
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
        return response.data.tweets;
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

  const fetchUserTweetsMedia = async (userId: string, page = 1, limit = 20) => {
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

  const fetchLikedTweetsByUser = async(userId: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.USER_TWEETS}/${userId}/likes`, {
        page,
        limit,
      });
      if (response.success && response.data) {
        return response.data.tweets;
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

 const fetchMentionedTab = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.MENTIONED_TWEETS}`);
   console.log("Media Tab",response)
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch mentioned tweets');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentioned tweets';
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
      }>(`${API_ENDPOINTS.LIKE_TWEET}/${tweetId}/like`);
      
      if (response.success && response.data) {
        console.log("tweet liked")
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
      }>(`${API_ENDPOINTS.RETWEET}/${tweetId}/retweet`);

      if (response.success && response.data) {
        console.log("tweet retweeted")
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
      const response = await apiService.post<Tweet>(`${API_ENDPOINTS.COMMENTS}/${tweetId}/comments`, {
        content,
      });

      
      if (response.success && response.data) {
        console.log("comment added")
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

  const addReply = async(content: string, commentId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<Tweet>(`${API_ENDPOINTS.CREATE_COMMENT_REPLY}/${commentId}/reply`, {
        content,
      });
    
      console.log(response)
      if (response.success && response.data) {
        console.log("reply added")
        return response;
      } else {
        throw new Error(response.error || 'Failed to add reply');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reply';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const likeReply = async(replyId: string) => {
    if (!user) return null;
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.post(`${API_ENDPOINTS.LIKE_COMMENT_REPLY}/${replyId}/like`);
        console.log(response)
        if(response.success && response.data) {
          console.log("reply liked")
          return response;
        } else {
          throw new Error(response.error || 'Failed to like reply');
        }
      
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to like reply';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }

  }

  const createTweet = async (formData:any) => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Replace this with your actual API call
      const response = await apiService.postForm(API_ENDPOINTS.CREATE_TWEET, formData);

      if (response.success && response.data) {
        console.log('✅ Tweet created successfully:');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create tweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tweet';
      setError(errorMessage);
      console.error('❌ Tweet creation failed:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };


  const fetchCommentsByTweetId = async (tweetId: string , limit = 10 , timeFrame = '24') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.COMMENTS}/${tweetId}/comments`,{
        limit,
        timeFrame
      });
      
      if (response.success && response.data) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to fetch comments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getReplyByCommentId = async (commentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.GET_COMMENT_REPLY}/${commentId}/replies`);
  
      if (response.success && response.data) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to fetch replies');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch replies';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReply = async (replyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.DELETE_COMMENT_REPLY}/${replyId}`);
      console.log("reply deleted",response)
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to delete reply');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reply';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }


  const likeComment = async (commentId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post(`${API_ENDPOINTS.LIKE_COMMENT}/${commentId}/like`);
        console.log("comment liked",response)
      if (response.success && response.data) {
      
        return response.data.comment;
      } else {
        throw new Error(response.error || 'Failed to like comment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like comment';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const deleteComment = async (commentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.DELETE_COMMENT}/${commentId}`);
      console.log("comment deleted",response)
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to delete comment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }


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

  const getTrendingHashtagTweets = async (tag: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Tweet[]>(`${API_ENDPOINTS.HASHTAG_TWEETS}/${tag}`);
    
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch trending hashtag tweets');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending hashtag tweets';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  const deleteTweet = async(tweetId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.DELETE_TWEET}/${tweetId}`);
           console.log("tweet deleted",response)
      if (response.success && response.data) {
        return response.data;
   
      } else {
        throw new Error(response.error || 'Failed to delete tweet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tweet';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    fetchHomeTweets,
    fetchUserTweets,
    fetchUserTweetsMedia,
    fetchLikedTweetsByUser,
    fetchMentionedTab,
    fetchTweetById,
    likeTweet,
    retweet,
    createTweet,
    deleteTweet,
    searchTweets,
    getTrendingHashtags,
    getTrendingHashtagTweets,
    addComment,
    deleteComment,
    getReplyByCommentId,
    addReply,
    likeReply,
    deleteReply,
    fetchCommentsByTweetId,
    likeComment
  };
};