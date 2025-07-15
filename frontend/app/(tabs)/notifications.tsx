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
    <View style={styles.container}>
      {hasUnreadNotifications && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Check size={16} color={colors.background} />
          <Text style={styles.markAllText}>Mark all as read</Text>
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              When you get notifications, they'll show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
  },
  markAllText: {
    color: colors.background,
    fontWeight: '500' as const,
    marginLeft: 8,
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
});