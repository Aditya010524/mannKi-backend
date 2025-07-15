import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ProfileHeader } from '@/components/ProfileHeader';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useAuth } from '@/hooks/useAuth';
import { useTweets } from '@/hooks/useTweets';
import { useUsers } from '@/hooks/useUsers';
import { colors } from '@/constants/colors';
import { Tweet, User } from '@/types';

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { fetchUserTweets } = useTweets();
  const { getUserByUsername } = useUsers();
  
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tweets' | 'replies' | 'media' | 'likes'>('tweets');
  
  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);
  
  const loadUserProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const profileUser = await getUserByUsername(username);
      if (profileUser) {
        setUser(profileUser);
        await loadTweets(profileUser.id);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTweets = async (userId: string) => {
    try {
      const userTweets = await fetchUserTweets(userId);
      setTweets(userTweets);
    } catch (error) {
      console.error('Failed to load tweets:', error);
    }
  };
  
  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    await loadTweets(user.id);
    setRefreshing(false);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }
  
  const isCurrentUser = currentUser?.id === user.id;
  
  return (
    <View style={styles.container}>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TweetComponent tweet={item} onRefresh={() => loadTweets(user.id)} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <ProfileHeader
              user={user}
              isCurrentUser={isCurrentUser}
            />
            
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'tweets' && styles.activeTab]}
                onPress={() => setActiveTab('tweets')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'tweets' && styles.activeTabText]}
                >
                  Tweets
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'replies' && styles.activeTab]}
                onPress={() => setActiveTab('replies')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'replies' && styles.activeTabText]}
                >
                  Replies
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'media' && styles.activeTab]}
                onPress={() => setActiveTab('media')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}
                >
                  Media
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
                onPress={() => setActiveTab('likes')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}
                >
                  Likes
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tweets yet</Text>
            <Text style={styles.emptySubtext}>
              When {isCurrentUser ? 'you post' : `${user.name} posts`} tweets, they'll show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700' as const,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.secondaryText,
  },
  activeTabText: {
    color: colors.primary,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});