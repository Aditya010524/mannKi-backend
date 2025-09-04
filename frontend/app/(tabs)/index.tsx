import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useTweets } from '@/hooks/useTweets';
import { colors } from '@/constants/colors';
import { Tweet } from '@/types';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { fetchHomeTweets, isLoading } = useTweets();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadTweets = async () => {
    const homeTweets = await fetchHomeTweets();
    setTweets(homeTweets);
  };
  
  useEffect(() => {
    loadTweets();
  
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTweets();
    setRefreshing(false);
  };
  
  const navigateToCompose = () => {
    router.push('/compose');
  };
  
  return (
    <View className='flex-1 bg-background'>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TweetComponent tweet={item} onRefresh={loadTweets} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      
      <TouchableOpacity className='absolute bottom-6 right-6 items-center justify-center h-16 w-16 rounded-full bg-primary' onPress={navigateToCompose}>
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}
