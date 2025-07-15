    import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Heart, MessageCircle, Repeat, User as UserIcon } from 'lucide-react-native';
import { Notification } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatDate';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onRefresh?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRefresh 
}) => {
  const { markAsRead } = useNotifications();
  
  const handlePress = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
      if (onRefresh) onRefresh();
    }
    
    if (notification.type === 'follow') {
      router.push(`/profile/${notification.sender.username}`);
    } else if (notification.relatedTweet) {
      router.push(`/tweet/${notification.relatedTweet.id}`);
    }
  };
  
  const renderIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart size={16} color={colors.danger} fill={colors.danger} />;
      case 'retweet':
        return <Repeat size={16} color={colors.success} />;
      case 'comment':
        return <MessageCircle size={16} color={colors.primary} />;
      case 'follow':
        return <UserIcon size={16} color={colors.primary} />;
      case 'mention':
        return <Text style={styles.mentionIcon}>@</Text>;
      default:
        return null;
    }
  };
  
  const renderText = () => {
    switch (notification.type) {
      case 'like':
        return (
          <Text style={styles.text}>
            <Text style={styles.name}>{notification.sender.name}</Text> liked your tweet
          </Text>
        );
      case 'retweet':
        return (
          <Text style={styles.text}>
            <Text style={styles.name}>{notification.sender.name}</Text> retweeted your tweet
          </Text>
        );
      case 'comment':
        return (
          <Text style={styles.text}>
            <Text style={styles.name}>{notification.sender.name}</Text> commented on your tweet
          </Text>
        );
      case 'follow':
        return (
          <Text style={styles.text}>
            <Text style={styles.name}>{notification.sender.name}</Text> followed you
          </Text>
        );
      case 'mention':
        return (
          <Text style={styles.text}>
            <Text style={styles.name}>{notification.sender.name}</Text> mentioned you in a tweet
          </Text>
        );
      default:
        return null;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        !notification.read && styles.unreadContainer
      ]} 
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      
      <Image source={{ uri: notification.sender.profilePic }} style={styles.avatar} />
      
      <View style={styles.content}>
        {renderText()}
        
        {notification.relatedTweet && (
          <Text style={styles.tweetContent} numberOfLines={2}>
            {notification.relatedTweet.content}
          </Text>
        )}
        
        <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
      </View>
    </TouchableOpacity>
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
  unreadContainer: {
    backgroundColor: colors.extraLightGray,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 4,
  },
  mentionIcon: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 4,
  },
  name: {
    fontWeight: '700' as const,
  },
  tweetContent: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.secondaryText,
  },
});