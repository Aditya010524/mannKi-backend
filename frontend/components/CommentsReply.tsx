import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Platform } from "react-native";
import { Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/colors";
import { formatDate } from "@/utils/formatDate";
import { Comment as CommentType } from "@/types";
import { useTweets } from "@/hooks/useTweets";
import { useAuth } from "@/hooks/useAuth";
import OptionsMenu from "./OptionsMenuModal";
import { MoreVertical } from "lucide-react-native";

type Props = {
  reply: CommentType;
  onDelete: (id: string) => void
};

export function CommentReply({ reply , onDelete }: Props) {
const {user} = useAuth()
  const {likeReply} = useTweets();
  const [isLiked, setIsLiked] = useState(reply?.isLiked);
  const [likeCount, setLikeCount] = useState(reply?.stats?.likes);
  const [MenuVisible, setMenuVisible] = useState(false)

     const tweetOptions: MenuOption[] = [
  { title: "Not interested", onPress: () => console.log('Not interested in:', reply.id) },
  { title: "Report Tweet", onPress: () => console.log('Reporting:', reply.id) },
  ]
 if(user?.id === reply?.author?.id){
   tweetOptions.push({ title: "Delete Tweet", onPress: () => onDelete(reply.id), isDestructive: true })
 }

  const handleLike = async() => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
try{
  const response = await likeReply(reply.id);
  
 if(response?.success){
  console.log(isLiked)
  setIsLiked(!isLiked);
  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  console.log("likeCount",likeCount)
 }
}
catch(err){
  console.log(err)
}

  
  };

  return (
    <View className="flex-row mt-2 ml-5 rounded-xl bg-white  p-2 ">
      {/* Avatar */}
      <Image
        source={{ uri: reply?.author?.avatar }}
        className="w-8 h-8 rounded-full mr-2"
      />

      {/* Content */}
      <TouchableOpacity className="flex-1">
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
           <TouchableOpacity onPress={()=>setMenuVisible(true)}>
        <MoreVertical size={18} color={colors.lightGray} />
        {
          MenuVisible && <OptionsMenu  MenuVisible={MenuVisible}
        onClose={() => setMenuVisible(false)}
        options={tweetOptions}
          />
        }
      </TouchableOpacity>
        </View>

        <Text className="text-[13px] leading-5 text-gray-800">
          {reply?.content}
        </Text>
      </TouchableOpacity>

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
