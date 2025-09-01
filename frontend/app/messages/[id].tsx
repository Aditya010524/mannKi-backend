import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Message } from '@/types';
import { formatMessageDate } from '@/utils/formatDate';
import socketService from '@/services/socket';
import TypingIndicator from '@/components/TypingIndicator';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    fetchMessages,
    sendMessage,
    messages,
    isLoading
  } = useMessages();

  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user && id) {
      fetchMessages(id).then((fetchedMessages: Message[]) => {
        const firstMessage = fetchedMessages[0];
        if (!firstMessage) return;

        const { sender, recipient } = firstMessage;
        const receiver = sender.id === user.id ? recipient : sender;

        setReceiverId(receiver.id);
      });
    }
  }, [user, id]);

  useEffect(() => {
    socketService.onUserTyping(({ userId }) => {
      if (userId === receiverId) {
        setIsReceiverTyping(true);
      }
    });

    socketService.onUserStopTyping(({ userId }) => {
      if (userId === receiverId) {
        setIsReceiverTyping(false);
      }
    });

    return () => {
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
    };
  }, [receiverId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    return () => {
      showSub.remove();
    };
  }, []);

const handleSendMessage = async () => {
  if (!user || !id || !messageText.trim() || !receiverId) return;

  setIsSubmitting(true);

  const textToSend = messageText; // Capture before clearing
  setMessageText(''); // Clear input immediately

  try {
    const newMessage = await sendMessage(receiverId, textToSend);
    if (newMessage) {
      socketService.stopTyping(id);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    setMessageText(textToSend); // Rollback in case of error
  } finally {
    setIsSubmitting(false);
  }
};


  const handleTyping = (text: string) => {
    setMessageText(text);

    if (user && id) {
      socketService.startTyping(id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(id);
      }, 1500);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender.id === user?.id;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.sender.profilePic }} style={styles.avatar} />
        )}

        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
          ]}>
            {formatMessageDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
      >
        <View style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messagesList, { paddingBottom: 120 }]}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Send a message to start the conversation.
                </Text>
              </View>
            }
          />

          {isReceiverTyping && (
            <View style={{ paddingLeft: 16, marginBottom: 4 }}>
              <TypingIndicator />
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.secondaryText}
              value={messageText}
              onChangeText={handleTyping}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || isSubmitting) && styles.disabledButton,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSubmitting}
            >
              <Send size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: colors.extraLightGray,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
  },
  sentMessageText: {
    color: colors.background,
  },
  receivedMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },
  sentMessageTime: {
    color: colors.background,
  },
  receivedMessageTime: {
    color: colors.secondaryText,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: colors.extraLightGray,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
});
