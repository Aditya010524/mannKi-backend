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
    console.log('Selected user:', user._id);
    router.push(`/messages/${user._id}`);
  };
  
  return (
    <View className='flex-1 bg-background'>
      <View className='flex-row items-center p-5 border-b border-border'>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View className='flex-row items-center ml-4 flex-1 bg-extraLightGray rounded-full px-2 py-1'>
          <SearchIcon size={20} color={colors.secondaryText} />
          <TextInput
           className='ml-2 flex-1 text-text'
            placeholder="Search for people"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      </View>
      
      {isSearching ? (
        <View className='p-6 items-center'>
          <Text className='text-lg text-secondaryText'>Searching...</Text>
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
            <View className='p-6 items-center'>
              {searchQuery.trim().length > 0 ? (
                <Text className='text-lg text-secondaryText'>No users found for "{searchQuery}"</Text>
              ) : (
                <Text className='text-lg text-secondaryText'>Search for people to message</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
