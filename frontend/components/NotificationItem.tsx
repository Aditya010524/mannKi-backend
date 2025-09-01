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
        return <Text className='text-md text-gray-800 mb-1'>@</Text>;
      default:
        return null;
    }
  };
  
  const renderText = () => {
    switch (notification.type) {
      case 'like':
        return (
          <Text className='text-md text-gray-800 mb-1' >
            <Text className='font-bold'>{notification.sender.name}</Text> liked your tweet
          </Text>
        );
      case 'retweet':
        return (
          <Text className='text-md text-gray-800 mb-1'>
            <Text className='font-bold'>{notification.sender.name}</Text> retweeted your tweet
          </Text>
        );
      case 'comment':
        return (
          <Text className='text-md text-gray-800 mb-1'>
            <Text className='font-bold'>{notification.sender.name}</Text> commented on your tweet
          </Text>
        );
      case 'follow':
        return (
          <Text className='text-md text-gray-800 mb-1'>
            <Text className='font-bold'>{notification.sender.name}</Text> followed you
          </Text>
        );
      case 'mention':
        return (
          <Text className='text-md text-gray-800 mb-1'>
            <Text className='font-bold'>{notification.sender.name}</Text> mentioned you in a tweet
          </Text>
        );
      default:
        return null;
    }
  };
  
  return (
    <TouchableOpacity 
    className={`flex-row p-4 border-b border-border ${!notification.read ? 'bg-extraLightGray' : 'bg-background'}`}
      onPress={handlePress}
    >
      <View className='flex-row items-center justify-center w-8 h-8 mr-2 rounded-full'>
        {renderIcon()}
      </View>
      <Image source={{ uri: notification.sender.profilePic }} className='w-10 h-10 rounded-full mr-3 ' />
      
      <View className='flex-1'>
        {renderText()}
        
        {notification.relatedTweet && (
          <Text className='text-md text-gray-800 ' numberOfLines={2}>
            {notification.relatedTweet.content}
          </Text>
        )}
        
        <Text className='text-sm text-secondaryText'>{formatDate(notification.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};
