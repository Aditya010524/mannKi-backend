import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { X, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTweets } from '@/hooks/useTweets';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function ComposeScreen() {
  const { user } = useAuth();
  const { createTweet, isLoading } = useTweets();
  const [tweetText, setTweetText] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleClose = () => {
    router.back();
  };
  
const handleTweet = async () => {
  if (!user || !tweetText.trim()) return;

  setIsSubmitting(true);

  try {
    const formData = new FormData();
    formData.append('content', tweetText);

    media.forEach((uri, index) => {
      const fileName = uri.split('/').pop() || `image-${index}.jpg`;
      const fileType = fileName.split('.').pop();

      formData.append('media', {
        uri,
        name: fileName,
        type: `image/${fileType}`,
      } as any); // casting for React Native
    });

    const newTweet = await createTweet(formData);
    if (newTweet) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/(tabs)');
    }
  } catch (error) {
    console.error('Failed to create tweet:', error);
  } finally {
    setIsSubmitting(false);
  }
};


  
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setMedia([...media, result.assets[0].uri]); // only keep uri
  }
};

  
  const removeImage = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };
  
  if (!user) return null;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tweetButton,
            (!tweetText.trim() || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleTweet}
          disabled={!tweetText.trim() || isSubmitting}
        >
          <Text style={styles.tweetButtonText}>Tweet</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.tweetContainer}>
          <Image source={{ uri: user.profilePic }} style={styles.avatar} />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's happening?"
              placeholderTextColor={colors.secondaryText}
              value={tweetText}
              onChangeText={setTweetText}
              multiline
              autoFocus
              maxLength={280}
            />
            
            {media.length > 0 && (
              <View style={styles.mediaContainer}>
                {media.map((uri, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image source={{ uri }} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <ImageIcon size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.characterCount}>
          <Text
            style={[
              styles.characterCountText,
              tweetText.length > 260 && styles.characterCountWarning,
              tweetText.length >= 280 && styles.characterCountLimit,
            ]}
          >
            {280 - tweetText.length}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tweetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  tweetButtonText: {
    color: colors.background,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  tweetContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    minHeight: 100,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mediaButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCountText: {
    color: colors.secondaryText,
  },
  characterCountWarning: {
    color: 'orange',
  },
  characterCountLimit: {
    color: colors.danger,
  },
});