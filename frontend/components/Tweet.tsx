import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Repeat, Share2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Tweet as TweetType } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTweets } from '@/hooks/useTweets';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface TweetProps {
  tweet: TweetType;
  onRefresh?: () => void;
}

export const Tweet: React.FC<TweetProps> = ({ tweet, onRefresh }) => {
  const { user } = useAuth();
  const { likeTweet, retweet } = useTweets();
  const [isLiked, setIsLiked] = useState(user ? tweet.likes.includes(user.id) : false);
  const [likeCount, setLikeCount] = useState(tweet.likes.length);
  const [isRetweeted, setIsRetweeted] = useState(user ? tweet.retweets.includes(user.id) : false);
  const [retweetCount, setRetweetCount] = useState(tweet.retweets.length);

  const handleLike = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    await likeTweet(tweet.id);
    if (onRefresh) onRefresh();
  };

  const handleRetweet = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsRetweeted(!isRetweeted);
    setRetweetCount(isRetweeted ? retweetCount - 1 : retweetCount + 1);
    
    await retweet(tweet.id);
    if (onRefresh) onRefresh();
  };

  const handleComment = () => {
    router.push(`/tweet/${tweet.id}`);
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const navigateToProfile = () => {
    router.push(`/profile/${tweet.user.username}`);
  };

  const navigateToTweet = () => {
    router.push(`/tweet/${tweet.id}`);
  };

  return (
    <Pressable style={styles.container} onPress={navigateToTweet}>
      <TouchableOpacity onPress={navigateToProfile}>
        <Image source={{ uri: tweet.user.profilePic }} style={styles.avatar} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateToProfile}>
            <Text style={styles.name}>{tweet.user.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToProfile}>
            <Text style={styles.username}>@{tweet.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>{formatDate(tweet.createdAt)}</Text>
        </View>
        
        <Text style={styles.tweetText}>{tweet.content}</Text>
        
        {tweet.media && tweet.media.length > 0 && (
          <Image source={{ uri: tweet.media[0] }} style={styles.media} />
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <MessageCircle size={18} color={colors.lightGray} />
            {tweet.comments.length > 0 && (
              <Text style={styles.actionText}>{tweet.comments.length}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleRetweet}>
            <Repeat 
              size={18} 
              color={isRetweeted ? colors.success : colors.lightGray} 
            />
            {retweetCount > 0 && (
              <Text 
                style={[
                  styles.actionText, 
                  isRetweeted && { color: colors.success }
                ]}
              >
                {retweetCount}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart 
              size={18} 
              fill={isLiked ? colors.danger : 'transparent'} 
              color={isLiked ? colors.danger : colors.lightGray} 
            />
            {likeCount > 0 && (
              <Text 
                style={[
                  styles.actionText, 
                  isLiked && { color: colors.danger }
                ]}
              >
                {likeCount}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={18} color={colors.lightGray} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: '700' as const,
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  username: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  dot: {
    color: colors.secondaryText,
    marginHorizontal: 4,
  },
  time: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  tweetText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: colors.text,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondaryText,
  },
});