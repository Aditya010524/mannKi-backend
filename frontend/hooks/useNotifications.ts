import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import { API_ENDPOINTS } from '@/config/api';
import { Notification } from '@/types';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // useEffect(() => {
  //   // Set up real-time listeners
  //   if (socketService.connected) {
  //     socketService.onNewNotification((notification) => {
  //       setNotifications(prev => [notification, ...prev]);
  //       setUnreadCount(prev => prev + 1);
  //     });

  //     socketService.onNotificationRead((notificationId) => {
  //       setNotifications(prev => 
  //         prev.map(notif => 
  //           notif.id === notificationId 
  //             ? { ...notif, read: true }
  //             : notif
  //         )
  //       );
  //       setUnreadCount(prev => Math.max(0, prev - 1));
  //     });
  //   }

  //   return () => {
  //     socketService.off('new_notification');
  //     socketService.off('notification_read');
  //   };
  // }, []);

  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        setNotifications(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return 0;
    
    try {
    //   const response = await apiService.get<{ count: number }>(API_ENDPOINTS.UNREAD_COUNT);
      
    //   if (response.success && response.data) {
    //     setUnreadCount(response.data.count);
    //     return response.data.count;
    //   } else {
    //     return 0;}

    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  };

  const markAsRead = async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post(`${API_ENDPOINTS.MARK_READ}/${notificationId}`);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      } else {
        throw new Error(response.error || 'Failed to mark notification as read');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post(API_ENDPOINTS.MARK_ALL_READ);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        return true;
      } else {
        throw new Error(response.error || 'Failed to mark all notifications as read');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};