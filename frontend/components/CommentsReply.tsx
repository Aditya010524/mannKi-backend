import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Platform } from "react-native";
import { Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/colors";
import { formatDate } from "@/utils/formatDate";
import { Comment as CommentType } from "@/types";

type Props = {
  reply: CommentType;
};

export function CommentReply({ reply }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply?.stats?.likes || 0);

  const handleLike = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsLiked((prev) => !prev);
    setLikeCount((c) => c + (isLiked ? -1 : 1));
  };

  return (
    <View className="flex-row mt-2 ml-5 rounded-xl bg-white  p-2 ">
      {/* Avatar */}
      <Image
        source={{ uri: reply?.author?.avatar }}
        className="w-8 h-8 rounded-full mr-2"
      />

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row flex-wrap items-center mb-1">
          <Text className="text-[13px] font-semibold text-gray-900 mr-1">
            {reply?.author?.displayName || "Unknown"}
          </Text>
          <Text className="text-[11px] text-gray-500 mr-1">
            @{reply?.author?.username}
          </Text>
          <Text className="text-[11px] text-gray-400">
            {formatDate(reply?.createdAt)}
          </Text>
        </View>

        <Text className="text-[13px] leading-5 text-gray-800">
          {reply?.content}
        </Text>
      </View>

      {/* Like button */}
      <TouchableOpacity
        className="items-center pl-1"
        onPress={handleLike}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Heart
          size={16}
          fill={isLiked ? colors.danger : "transparent"}
          color={isLiked ? colors.danger : colors.gray}
        />
        {likeCount > 0 && (
          <Text
            className={`mt-0.5 text-xs ${
              isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            {likeCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
