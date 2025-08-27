import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Settings } from 'lucide-react-native';
import { ProfileHeader } from '@/components/ProfileHeader';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useAuth } from '@/hooks/useAuth';
import { useTweets } from '@/hooks/useTweets';
import { colors } from '@/constants/colors';
import { Tweet } from '@/types';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { fetchUserTweets, isLoading } = useTweets();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tweets' | 'replies' | 'media' | 'likes'>('tweets');
  
  const loadTweets = async () => {
    if (!user) return;
    
    const userTweets = await fetchUserTweets(user.id);
    setTweets(userTweets);
  };
  
  useEffect(() => {
    if (user) {
      loadTweets();
    }
  }, [user]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTweets();
    setRefreshing(false);
  };
  
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };
  
  const handleSettings = () => {
    router.push('/settings');
  };
  
  if (!user) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TweetComponent tweet={item} onRefresh={loadTweets} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <ProfileHeader
              user={user}
              isCurrentUser={true}
              onEditProfile={handleEditProfile}
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
              When you post tweets, they'll show up here.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
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