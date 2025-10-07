import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Conversation } from '@/types';
import { colors } from '@/constants/colors';
import { formatMessageDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/useAuth';

interface MessageThreadProps {
  conversation: Conversation;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ conversation }) => {
  const { user } = useAuth();

  if (!user) return null;
  // Identify the other participant in the conversation
  const otherUser = conversation?.user

  const navigateToChat = () => {
    // ✅ Use conversation.id instead of otherUser.id
    router.push(`/messages/${otherUser.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={navigateToChat}>
      <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{otherUser?.displayName}</Text>
          <Text style={styles.username}>@{otherUser?.username}</Text>
          <Text style={styles.time}>{formatMessageDate(conversation?.lastMessage?.createdAt)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.message,
              !conversation?.lastMessage?.read &&
                // conversation.lastMessage.recipient.id === user.id &&
                styles.unreadMessage,
            ]}
            numberOfLines={2}
          >
            {conversation?.lastMessage?.text}
          </Text>

          {conversation?.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation?.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: '700' as const,
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  username: {
    color: colors.secondaryText,
    fontSize: 14,
    flex: 1,
  },
  time: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.secondaryText,
    flex: 1,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500' as const,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700' as const,
    paddingHorizontal: 6,
  },
});
