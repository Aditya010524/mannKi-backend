import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ProfileHeader } from '@/components/ProfileHeader';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useTweets } from '@/hooks/useTweets';
import { Tweet, User } from '@/types';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { fetchUserTweets, fetchLikedTweetsByUser } = useTweets();
  const { getUserByUserId } = useUsers();

  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [mediaTweets, setMediaTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tweets' | 'media' | 'likes'>('tweets');

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
        await loadTweets(profileUser.id);
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

      // TODO: implement fetchUserTweetsMedia(id) if needed
      setMediaTweets([]);

      const userLikedTweet = await fetchLikedTweetsByUser(id);
      setLikedTweets(userLikedTweet);
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

  // ✅ config per tab
  const getTabConfig = () => {
    switch (activeTab) {
      case 'tweets':
        return {
          data: tweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={() => loadTweets(user.id)} />
          ),
          emptyText: 'No tweets yet',
        };
      case 'media':
        return {
          data: mediaTweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={() => loadTweets(user.id)} />
          ),
          emptyText: 'No media yet',
        };
      case 'likes':
        return {
          data: likedTweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={() => loadTweets(user.id)} />
          ),
          emptyText: 'No likes yet',
        };
      default:
        return { data: [], renderItem: () => null, emptyText: 'Nothing here' };
    }
  };

  const { data, renderItem, emptyText } = getTabConfig();

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
      <FlatList
        data={data}
        keyExtractor={(item, index) => (item?.id ? item.id : String(index))}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <ProfileHeader user={user} isCurrentUser={isCurrentUser} />

            <View className="flex-row border-b border-border">
              <TouchableOpacity
                className={`${inactiveTabStyle} ${activeTab === 'tweets' ? activeTabstyle : ''}`}
                onPress={() => setActiveTab('tweets')}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${activeTab === 'tweets' ? activeTabTextStyle : ''}`}
                >
                  Tweets
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${inactiveTabStyle} ${activeTab === 'media' ? activeTabstyle : ''}`}
                onPress={() => setActiveTab('media')}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${activeTab === 'media' ? activeTabTextStyle : ''}`}
                >
                  Media
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${inactiveTabStyle} ${activeTab === 'likes' ? activeTabstyle : ''}`}
                onPress={() => setActiveTab('likes')}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${activeTab === 'likes' ? activeTabTextStyle : ''}`}
                >
                  Likes
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="p-6 items-center">
            <Text className="text-lg font-semibold mb-2">{emptyText}</Text>
            <Text className="text-lg font-bold text-center">
              {isCurrentUser
                ? `When you post ${activeTab}, they'll show up here.`
                : `When ${user.name} posts ${activeTab}, they'll show up here.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}
