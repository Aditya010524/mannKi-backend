import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search as SearchIcon, TrendingUp } from 'lucide-react-native';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { UserCard } from '@/components/UserCard';
import { colors } from '@/constants/colors';
import { Tweet, User } from '@/types';
import { useTweets } from '@/hooks/useTweets';
import { useUsers } from '@/hooks/useUsers';

export default function ExploreScreen() {
  const { searchTweets, getTrendingHashtags, getTrendingHashtagTweets } = useTweets();
  const { searchUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ tweets: Tweet[]; users: User[] }>({ tweets: [], users: [] });
  const [trendingHashtags, setTrendingHashtags] = useState<{ hashtag: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'top' | 'users' | 'tweets'>('top');
  const [isSearching, setIsSearching] = useState(false);

  // cache to avoid duplicate API calls
  const searchCache = useRef<Record<string, { tweets: Tweet[]; users: User[] }>>({});

  useEffect(() => {
    loadTrendingHashtags();
  }, []);

  // 🔑 Debounced search (now respects hashtags)
  useEffect(() => {
    if (searchQuery?.trim()?.length <= 2) {
      setSearchResults({ tweets: [], users: [] });
      return;
    }

    const delayDebounce = setTimeout(() => {
      if (searchQuery?.startsWith('#')) {
        handleHashtagSearch(searchQuery.replace('#', '')); // ✅ handle hashtags
      } else {
        handleSearch(searchQuery); // ✅ normal search
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (searchQuery?.trim()?.length > 2) {
        if (searchQuery.startsWith('#')) {
          handleHashtagSearch(searchQuery.replace('#', ''));
        } else {
          handleSearch(searchQuery);
        }
      }
    }, [searchQuery])
  );

  const loadTrendingHashtags = async () => {
    try {
      const trending = await getTrendingHashtags();
      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Failed to load trending hashtags:', error);
    }
  };

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults({ tweets: [], users: [] });
      return;
    }

    if (searchCache.current[trimmedQuery]) {
      setSearchResults(searchCache.current[trimmedQuery]);
      return;
    }

    setIsSearching(true);
    try {
      const [tweetsResult, usersResult] = await Promise.all([
        searchTweets(trimmedQuery),
        searchUsers(trimmedQuery),
      ]);
      const results = { tweets: tweetsResult, users: usersResult };
      searchCache.current[trimmedQuery] = results;
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ tweets: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleHashtagSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    if (searchCache.current[`#${trimmedQuery}`]) {
      setSearchResults(searchCache.current[`#${trimmedQuery}`]);
      return;
    }

    setIsSearching(true);
    try {
      const tweetsResult = await getTrendingHashtagTweets(trimmedQuery);
      const results = { tweets: tweetsResult.tweets, users: [] };
      searchCache.current[`#${trimmedQuery}`] = results;
      setSearchResults(results);
      setActiveTab('tweets'); // 👈 go directly to tweets tab
    } catch (error) {
      console.error('Hashtag search failed:', error);
      setSearchResults({ tweets: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollowChange = (userId: string, newFollowStatus: boolean) => {
    setSearchResults(currentResults => {
      const updatedUsers = currentResults.users.map(user =>
        user._id === userId ? { ...user, followStatus: { ...user.followStatus, isFollowing: newFollowStatus } } : user
      );
      return { ...currentResults, users: updatedUsers };
    });
  };

  const renderTrendingHashtags = () => (
    <View className='p-4'>
      <View className='flex-row items-center mb-4'>
        <TrendingUp size={20} color={colors.text} />
        <Text className='ml-2 text-2xl font-semibold text-text'>Trending</Text>
      </View>

      {trendingHashtags.map((item) => (
        <TouchableOpacity
          key={item.hashtag}
          className='py-3 border-b border-border mb-1'
          onPress={() => {
            setSearchQuery(`#${item.hashtag}`);
            handleHashtagSearch(item.hashtag);
          }}
        >
          <Text className='text-lg font-semibold text-text'>#{item.hashtag}</Text>
          <Text className='text-md text-secondaryText'>{item.count} tweets</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchResults = () => {
    if (searchQuery?.trim()?.length <= 2) {
      return renderTrendingHashtags();
    }

    if (isSearching) {
      return (
        <View className='p-6 items-center'>
          <Text className='text-lg text-secondaryText'>Searching...</Text>
        </View>
      );
    }

    if (activeTab === 'top') {
      return (
        <ScrollView>
          {searchResults?.users?.length > 0 && (
            <View className="py-3">
              <Text className="text-base font-bold text-text px-4 mb-2">People</Text>
              {searchResults.users.slice(0, 3).map((user) => (
                <UserCard key={user._id} user={user} onFollowChange={handleFollowChange} />
              ))}
              {searchResults?.users?.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab('users')}>
                  <Text className='text-sm text-primary px-4 py-3'>Show more</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {searchResults?.tweets?.length > 0 && (
            <View className='p-4 border-t border-border'>
              <Text className='text-lg font-semibold text-text'>Tweets</Text>
              {searchResults.tweets.slice(0, 3).map((tweet) => (
                <TweetComponent key={tweet.id} tweet={tweet} />
              ))}
              {searchResults?.tweets?.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab('tweets')}>
                  <Text className='text-md text-secondaryText'>Show more</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {searchResults?.users?.length === 0 && searchResults?.tweets?.length === 0 && (
            <View className='p-6 items-center'>
              <Text className='text-base text-secondaryText text-center'>No results found for "{searchQuery}"</Text>
            </View>
          )}
        </ScrollView>
      );
    }

    if (activeTab === 'users') {
      return (
        <FlatList
          data={searchResults.users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <UserCard user={item} onFollowChange={handleFollowChange} />}
          ListEmptyComponent={
            <View className='p-6 items-center'>
              <Text className='text-lg text-secondaryText'>No users found for "{searchQuery}"</Text>
            </View>
          }
        />
      );
    }

    if (activeTab === 'tweets') {
      return (
        <FlatList
          data={searchResults.tweets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TweetComponent tweet={item} />}
          ListEmptyComponent={
            <View className='p-6 items-center'>
              <Text className='text-lg text-secondaryText'>No tweets found for "{searchQuery}"</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View className='flex-1 bg-background'>
      <View className='p-3 border-b border-border'>
        <View className='flex-row items-center bg-extraLightGray rounded-full px-3'>
          <SearchIcon size={20} color={colors.secondaryText} />
          <TextInput
            className='flex-1 py-2 px-2 text-base text-text'
            placeholder="Search Twitter"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
      </View>

      {searchQuery?.trim()?.length > 2 && (
        <View className='flex-row border-b border-border'>
          <TouchableOpacity
            className={`flex-1 items-center py-3 ${activeTab === 'top' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('top')}
          >
            <Text className={`font-medium ${activeTab === 'top' ? 'text-primary' : 'text-secondaryText'}`}>Top</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 items-center py-3 ${activeTab === 'users' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('users')}
          >
            <Text className={`font-medium ${activeTab === 'users' ? 'text-primary' : 'text-secondaryText'}`}>People</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 items-center py-3 ${activeTab === 'tweets' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('tweets')}
          >
            <Text className={`font-medium ${activeTab === 'tweets' ? 'text-primary' : 'text-secondaryText'}`}>Tweets</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderSearchResults()}
    </View>
  );
}
