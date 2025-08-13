import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Search as SearchIcon, TrendingUp } from 'lucide-react-native';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { UserCard } from '@/components/UserCard';
import { colors } from '@/constants/colors';
import { Tweet, User } from '@/types';
import { useTweets } from '@/hooks/useTweets';
import { useUsers } from '@/hooks/useUsers';

export default function ExploreScreen() {
  const { searchTweets, getTrendingHashtags } = useTweets();
  const { searchUsers } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    tweets: Tweet[];
    users: User[];
  }>({ tweets: [], users: [] });
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'top' | 'users' | 'tweets'>('top');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    loadTrendingHashtags();
  }, []);
  
  const loadTrendingHashtags = async () => {
    try {
      const trending = await getTrendingHashtags();
      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Failed to load trending hashtags:', error);
    }
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults({ tweets: [], users: [] });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const [tweetsResult, usersResult] = await Promise.all([
        searchTweets(query),
        searchUsers(query),
      ]);
      
      setSearchResults({
        tweets: tweetsResult,
        users: usersResult,
      });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ tweets: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };
  
  const renderTrendingHashtags = () => {
    return (
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={colors.text} />
          <Text style={styles.sectionTitle}>Trending</Text>
        </View>
        
        {trendingHashtags.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trendingItem}
            onPress={() => handleSearch(item.tag)}
          >
            <Text style={styles.trendingTag}>#{item.tag}</Text>
            <Text style={styles.trendingCount}>{item.count} tweets</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderSearchResults = () => {
    if (searchQuery.trim().length === 0) {
      return renderTrendingHashtags();
    }
    
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }
    
    if (activeTab === 'top') {
      return (
        <ScrollView>
          {searchResults.users.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>People</Text>
              {searchResults.users.slice(0, 3).map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
              {searchResults.users.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab('users')}>
                  <Text style={styles.showMoreText}>Show more</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {searchResults.tweets.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Tweets</Text>
              {searchResults.tweets.slice(0, 3).map((tweet) => (
                <TweetComponent key={tweet.id} tweet={tweet} />
              ))}
              {searchResults.tweets.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab('tweets')}>
                  <Text style={styles.showMoreText}>Show more</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {searchResults.users.length === 0 && searchResults.tweets.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            </View>
          )}
        </ScrollView>
      );
    }
    
    if (activeTab === 'users') {
      return (
        <FlatList
          data={searchResults.users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No users found for "{searchQuery}"</Text>
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
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No tweets found for "{searchQuery}"</Text>
            </View>
          }
        />
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={colors.secondaryText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search MANN KI"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      
      {searchQuery.trim().length > 0 && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'top' && styles.activeTab]}
            onPress={() => setActiveTab('top')}
          >
            <Text
              style={[styles.tabText, activeTab === 'top' && styles.activeTabText]}
            >
              Top
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text
              style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}
            >
              People
            </Text>
          </TouchableOpacity>
          
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
        </View>
      )}
      
      {renderSearchResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
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
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  trendingSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 8,
    color: colors.text,
  },
  trendingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendingTag: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  trendingCount: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  resultSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});