import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { X, Image as ImageIcon } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useTweets } from "@/hooks/useTweets";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

export default function ComposeScreen() {
  const { user } = useAuth();
  const { createTweet, isLoading } = useTweets();
  const [tweetText, setTweetText] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleTweet = async () => {
    if (!user || (!tweetText.trim() && media.length === 0)) 
    return;

    setIsSubmitting(true);
    let content = tweetText;
    try {
     
      const formData = new FormData();
      formData.append("content", tweetText);

      media.forEach((uri, index) => {
        const fileName = uri.split("/").pop() || `image-${index}.jpg`;
        const fileType = fileName.split(".").pop();

        formData.append("media", {
          uri,
          name: fileName,
          type: `image/${fileType}`,
        } as any); // casting for React Native
         console.log("formdata",formData)
      });

      const newTweet = await createTweet(formData);
      if (newTweet) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace("/(tabs)");
      }

    } catch (error) {
      console.error("Failed to create tweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Extract all selected image URIs
      const uris = result.assets.map((asset) => asset.uri);

      // Update state with all new images (spread old + new)
      setMedia([...media, ...uris]);
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
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View className="flex-row items-center justify-between p-4 border-b border-border">
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
          <Text className="font-bold text-white">Tweet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className=" ">
          <View className="flex-row p-4">
            <Image
              source={{ uri: user.avatar }}
              className="w-16 h-16 rounded-full"
            />

            <View>
            
              <Text className="font-bold text-xl text-text ml-4">
                {user.displayName}
              </Text>
              <Text className="text-sm text-secondaryText ml-4">
                @{user.username}
              </Text>
            </View>
          </View>
          <View className="flex-1 ml-4 mt-0">
            <TextInput
              className="text-lg text-text"
              placeholder="What's happening?"
              placeholderTextColor={colors.secondaryText}
              value={tweetText}
              onChangeText={setTweetText}
              multiline
              autoFocus
              maxLength={280}
            />

            {media.length > 0 && (
              <View className="flex-row flex-wrap mt-4">
                {media.map((uri, index) => (
                  <View key={index} className="relative mr-2 mb-2">
                    <Image
                      source={{ uri }}
                      className="w-[100] h-[100] rounded-lg"
                    />
                    <TouchableOpacity
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full"
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

      <View className="flex-row items-center justify-between p-4 border-t border-border">
        <TouchableOpacity className="p-2" onPress={pickImage}>
          <ImageIcon size={24} color={colors.primary} />
        </TouchableOpacity>

        <View className="p-2">
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
  tweetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },

  characterCount: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  characterCountText: {
    color: colors.secondaryText,
  },
  characterCountWarning: {
    color: "orange",
  },
  characterCountLimit: {
    color: colors.danger,
  },
});
