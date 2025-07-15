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
    <View style={styles.container}>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TweetComponent tweet={item} onRefresh={loadTweets} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      
      <TouchableOpacity style={styles.composeButton} onPress={navigateToCompose}>
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  composeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});