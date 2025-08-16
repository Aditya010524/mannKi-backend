import { useState, useEffect } from 'react';
import { Message, Conversation } from '@/types';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from './useAuth';

export const useMessages = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Set up real-time listeners
    if (socketService.connected) {
      socketService.onNewMessage((message) => {
        setMessages(prev => [...prev, message]);
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === message.sender.id || conv.id === message.recipient.id) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          })
        );
      });

      socketService.onMessageRead((data) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, read: true }
              : msg
          )
        );
      });

      socketService.onUserOnline((userId) => {
        console.log('User online:', userId);
      });

      socketService.onUserOffline((userId) => {
        console.log('User offline:', userId);
      });
    }

    return () => {
      socketService.off('new_message');
      socketService.off('message_read');
      socketService.off('user_online');
      socketService.off('user_offline');
    };
  }, []);

  const fetchConversations = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
      
      if (response.success && response.data) {
        setConversations(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch conversations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, page = 1, limit = 50) => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<Message[]>(`${API_ENDPOINTS.MESSAGES}/${conversationId}`, {
        page,
        limit,
      });
      
      if (response.success && response.data) {
        setMessages(response.data);
        
        // Mark conversation as read
        await apiService.post(`${API_ENDPOINTS.MARK_CONVERSATION_READ}/${conversationId}`);
        
        // Join the conversation room for real-time updates
        socketService.joinRoom(conversationId);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string): Promise<Message | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post<Message>(API_ENDPOINTS.SEND_MESSAGE, {
        recipientId :receiverId,
        content,
      });
      
      if (response.success && response.data) {
        const newMessage = response.data;
        setMessages(prev => [...prev, newMessage]);
        
        // Also emit via socket for real-time delivery
        socketService.sendMessage({ recipientId, content });
        
        return newMessage;
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await apiService.post(`${API_ENDPOINTS.MARK_CONVERSATION_READ}/${messageId}`);
      socketService.markMessageAsRead(messageId);
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  return {
    isLoading,
    error,
    conversations,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
  };
};