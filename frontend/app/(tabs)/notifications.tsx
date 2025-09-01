import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { NotificationItem } from '@/components/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { colors } from '@/constants/colors';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const { fetchNotifications, markAllAsRead, isLoading } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadNotifications = async () => {
    const userNotifications = await fetchNotifications();
    setNotifications(userNotifications);
  };
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };
  
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);
  
  return (
    <View className='flex-1 bg-background'>
      {hasUnreadNotifications && (
        <TouchableOpacity className='flex-row items-center justify-center bg-primary py-2' onPress={handleMarkAllAsRead}>
          <Check size={16} color={colors.background} />
          <Text className='ml-2 text-sm font-semibold text-background'>Mark all as read</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onRefresh={loadNotifications} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center p-6 mt-[100px]'>
            <Text className='text-lg font-semibold text-text'>No notifications yet</Text>
            <Text className='text-center text-secondaryText mt-2 text-md'>
              When you get notifications, they'll show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}


