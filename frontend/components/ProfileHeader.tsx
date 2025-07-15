import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Link, Calendar } from 'lucide-react-native';
import { User } from '@/types';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isCurrentUser,
  onEditProfile
}) => {
  const { user: currentUser, updateUser } = useAuth();
  
  const isFollowing = currentUser?.following.includes(user.id) || false;
  
  const handleFollow = async () => {
    if (!currentUser) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        await updateUser({
          following: currentUser.following.filter(id => id !== user.id)
        });
      } else {
        // Follow
        await updateUser({
          following: [...currentUser.following, user.id]
        });
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: user.coverPhoto }} style={styles.coverPhoto} />
      
      <View style={styles.profileSection}>
        <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
        
        {isCurrentUser ? (
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.followButton, 
              isFollowing && styles.followingButton
            ]} 
            onPress={handleFollow}
          >
            <Text 
              style={[
                styles.followButtonText, 
                isFollowing && styles.followingButtonText
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        
        <Text style={styles.bio}>{user.bio}</Text>
        
        <View style={styles.details}>
          {user.location && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.secondaryText} />
              <Text style={styles.detailText}>{user.location}</Text>
            </View>
          )}
          
          {user.website && (
            <View style={styles.detailItem}>
              <Link size={16} color={colors.secondaryText} />
              <Text style={[styles.detailText, styles.link]}>{user.website}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Calendar size={16} color={colors.secondaryText} />
            <Text style={styles.detailText}>{formatDate(user.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.stats}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{user.following.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  coverPhoto: {
    width: '100%',
    height: 150,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.background,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  editButtonText: {
    fontWeight: '700' as const,
    color: colors.text,
  },
  followButton: {
    backgroundColor: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    fontWeight: '700' as const,
    color: colors.background,
  },
  followingButtonText: {
    color: colors.text,
  },
  userInfo: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  username: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 4,
  },
  link: {
    color: colors.primary,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 20,
  },
  statValue: {
    fontWeight: '700' as const,
    color: colors.text,
    marginRight: 4,
  },
  statLabel: {
    color: colors.secondaryText,
  },
});