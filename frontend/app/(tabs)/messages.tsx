import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Search, Edit } from 'lucide-react-native';
import { MessageThread } from '@/components/MessageThread';
import { useMessages } from '@/hooks/useMessages';
import { colors } from '@/constants/colors';
import { Conversation } from '@/types';
import { router } from 'expo-router';

export default function MessagesScreen() {
  const { fetchConversations, isLoading } = useMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadConversations = async () => {
    const userConversations = await fetchConversations();
    console.log('Fetched Conversations:', userConversations);
    setConversations(userConversations);
  };
  
  useEffect(() => {
    loadConversations();
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchButton} onPress={navigateToSearch}>
          <Search size={16} color={colors.secondaryText} />
          <Text style={styles.searchText}>Search Direct Messages</Text>
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              When you send or receive messages, they'll show up here.
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.newMessageButton} onPress={navigateToNewMessage}>
        <Edit size={24} color={colors.background} />
      </TouchableOpacity>
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
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchText: {
    marginLeft: 8,
    color: colors.secondaryText,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 100,
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
  newMessageButton: {
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