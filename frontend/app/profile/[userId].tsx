import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ProfileHeader } from '@/components/ProfileHeader';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useTweets } from '@/hooks/useTweets';
import { Tweet, User } from '@/types';
import MediaGrid from "@/components/UserMediaTab";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { fetchUserTweets, fetchUserTweetsMedia, fetchLikedTweetsByUser } = useTweets();
  const { getUserByUserId } = useUsers();

  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [mediaTweets, setMediaTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tweets' | 'media' | 'likes'>('tweets');
  const [loadedTabs, setLoadedTabs] = useState<{tweets: boolean, media: boolean, likes: boolean}>({
    tweets: false,
    media: false,
    likes: false
  });

  const activeTabstyle = "border-b-2 border-primary py-3";
  const inactiveTabStyle = "flex-1 items-center py-3 ";
  const inactiveTabTextStyle = "font-medium";
  const activeTabTextStyle = "text-primary";

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const profileUser = await getUserByUserId(userId);
      if (profileUser) {
        setUser(profileUser);
        if (!loadedTabs.tweets) await loadTweets(profileUser.id);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTweets = async (id: string) => {
    try {
      const userTweets = await fetchUserTweets(id);
      setTweets(userTweets);
      setLoadedTabs(prev => ({ ...prev, tweets: true }));
    } catch (error) {
      console.error('Failed to load tweets:', error);
    }
  };

  const loadMedia = async (id: string) => {
    try {
      const userMedia = await fetchUserTweetsMedia(id);
      setMediaTweets(userMedia.media);
      setLoadedTabs(prev => ({ ...prev, media: true }));
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const loadLikes = async (id: string) => {
    try {
      const userLikedTweet = await fetchLikedTweetsByUser(id);
      setLikedTweets(userLikedTweet);
      setLoadedTabs(prev => ({ ...prev, likes: true }));
    } catch (error) {
      console.error('Failed to load likes:', error);
    }
  };

  // Load tab data only when user switches tab
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'tweets' && !loadedTabs.tweets) loadTweets(user.id);
    else if (activeTab === 'media' && !loadedTabs.media) loadMedia(user.id);
    else if (activeTab === 'likes' && !loadedTabs.likes) loadLikes(user.id);
  }, [activeTab, user]);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    if (activeTab === 'tweets') await loadTweets(user.id);
    else if (activeTab === 'media') await loadMedia(user.id);
    else if (activeTab === 'likes') await loadLikes(user.id);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-secondaryText">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-secondaryText">User not found</Text>
      </View>
    );
  }

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <View className="flex-1 bg-background">
      {activeTab !== 'media' ? (
        <FlatList
          data={activeTab === 'tweets' ? tweets : likedTweets}
          keyExtractor={(item, index) => item?.id || String(index)}
          renderItem={({ item }) => <TweetComponent tweet={item} onRefresh={handleRefresh} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={
            <>
              <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
              <View className="flex-row border-b border-border">
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'tweets' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('tweets')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'tweets' ? activeTabTextStyle : ''}`}>Tweets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'media' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('media')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'media' ? activeTabTextStyle : ''}`}>Media</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'likes' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('likes')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'likes' ? activeTabTextStyle : ''}`}>Likes</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View className="p-6 items-center">
              <Text className="text-lg font-semibold mb-2">
                {activeTab === 'tweets' ? 'No tweets yet' : 'No likes yet'}
              </Text>
              <Text className="text-lg font-bold text-center">
                {isCurrentUser
                  ? `When you post ${activeTab}, they'll show up here.`
                  : `When ${user.name} posts ${activeTab}, they'll show up here.`}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={mediaTweets}
           numColumns={3}
          key={`media-${3}`}
          keyExtractor={(item, index) => item?.id || String(index)}
          renderItem={({ item }) => <MediaGrid item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={
            <>
              <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
              <View className="flex-row border-b border-border">
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'tweets' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('tweets')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'tweets' ? activeTabTextStyle : ''}`}>Tweets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'media' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('media')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'media' ? activeTabTextStyle : ''}`}>Media</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${inactiveTabStyle} ${activeTab === 'likes' ? activeTabstyle : ''}`}
                  onPress={() => setActiveTab('likes')}
                >
                  <Text className={`${inactiveTabTextStyle} ${activeTab === 'likes' ? activeTabTextStyle : ''}`}>Likes</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View className="p-6 items-center">
              <Text className="text-lg font-semibold mb-2">No media yet</Text>
              <Text className="text-lg font-bold text-center">
                {isCurrentUser
                  ? `When you post media, they'll show up here.`
                  : `When ${user.name} posts media, they'll show up here.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
