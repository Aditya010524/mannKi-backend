import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { User } from '@/types';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = true,
  compact = false,
  onPress
}) => {
  const { user: currentUser } = useAuth();
  const { toggleFollow } = useUsers();
  
  const [isFollowing, setIsFollowing] = useState(user?.followStatus?.isFollowing || false); // Added this line
 
  // Sync with backend data when user prop changes
  useEffect(() => {
    setIsFollowing(user?.followStatus?.isFollowing || false);
  }, [user?.followStatus?.isFollowing]); // Added this useEffect
 
  const handleFollow = async () => {
   try {
    const response = await toggleFollow(user._id);
    console.log(user._id)
    console.log(response)
    if (response?.success?.action === "followed") {
      setIsFollowing(true);   

    }
    else if (response?.success?.action === "unfollowed") {
      setIsFollowing(false);
    }
   } catch (error) {
    
   }
  };
 
  const navigateToProfile = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user._id}`);
    }
  };
 
  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={navigateToProfile}
    >
      <Image
        source={{ uri: user.profilePic }}
        style={[styles.avatar, compact && styles.compactAvatar]}
      />
     
      <View style={styles.userInfo}>
        <Text style={styles.name} numberOfLines={1}>{user.displayName}</Text>
        <Text style={styles.username} numberOfLines={1}>@{user.username}</Text>
       
        {!compact && (
          <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
        )}
      </View>
     
      {showFollowButton && currentUser && currentUser._id !== user._id && (
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={handleFollow}
        >
         { currentUser._id === user._id ? null :  <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>}
        </TouchableOpacity>
      )}
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
    alignItems: 'center',
  },
  compactContainer: {
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '700' as const,
    fontSize: 16,
    color: colors.text,
  },
  username: {
    color: colors.secondaryText,
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  followButton: {
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.background,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  followingButtonText: {
    color: colors.text,
  },
});