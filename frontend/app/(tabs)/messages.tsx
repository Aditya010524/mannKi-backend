import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Search, Edit } from 'lucide-react-native';
import { MessageThread } from '@/components/MessageThread';
import { useMessages } from '@/hooks/useMessages';
import { colors } from '@/constants/colors';
import { Conversation } from '@/types';
import { router } from 'expo-router';
import socketService from '@/services/socket';
export default function MessagesScreen() {
  const { fetchConversations, isLoading , conversations  } = useMessages();
  const [refreshing, setRefreshing] = useState(false);
  
  const loadConversations = async () => {
  await fetchConversations();
  };
  
  useEffect(() => {
    loadConversations();
    if(!socketService.isConnected) {
      socketService.connect();
      console.log('Socket connected from MessagesScreen', socketService.Socket?.id);
    }
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };
  
  const navigateToSearch = () => {
    router.push('/search-users');
  };
  
  const navigateToNewMessage = () => {
    router.push('/search-users');
  };
  
  return (
    <View className='flex-1 bg-background'>
      <View className='p-3 border-b border-border'>
        <TouchableOpacity className='flex-row items-center px-4 py-3 bg-extraLightGray rounded-full' onPress={navigateToSearch}>
          <Search size={16} color={colors.secondaryText} />
          <Text className='ml-2 text-secondaryText text-md'>Search Direct Messages</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageThread conversation={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center p-6 mt-[100px]'>
            <Text className='text-2xl font-bold text-text'>No messages yet</Text>
            <Text className='text-center text-secondaryText mt-2 items-center text-md'>
              When you send or receive messages, they'll show up here.
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity className='absolute bottom-4 right-4 bg-primary rounded-full p-5' onPress={navigateToNewMessage}>
        <Edit size={24} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}
