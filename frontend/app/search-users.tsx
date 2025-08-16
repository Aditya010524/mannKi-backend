import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react-native';
import { UserCard } from '@/components/UserCard';
import { colors } from '@/constants/colors';
import { User } from '@/types';
import { useUsers } from '@/hooks/useUsers';


export default function SearchUsersScreen() {
  const { searchUsers } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectUser = (user: User) => {
    router.push(`/messages/${user.id}`);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={colors.secondaryText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for people"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      </View>
      
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              showFollowButton={false}
              onPress={() => handleSelectUser(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {searchQuery.trim().length > 0 ? (
                <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
              ) : (
                <Text style={styles.emptyText}>Search for people to message</Text>
              )}
            </View>
          }
        />
      )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});