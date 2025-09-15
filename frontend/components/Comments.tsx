import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import { Comment as CommentType, Reply as ReplyType } from "@/types"; // make sure ReplyType exists in your types
import { colors } from "@/constants/colors";
import { formatDate } from "@/utils/formatDate";
import { Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTweets } from "@/hooks/useTweets";
import { CommentReply } from "@/components/CommentsReply";
import  OptionsMenu  from "./OptionsMenuModal";
import { MoreVertical } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";

type Props = { 
  comment: CommentType,
  onDelete: (id: string) => void

 };

export function Comment({ comment , onDelete }: Props) {
  const {user} = useAuth();
  const { likeComment, addReply, getReplyByCommentId ,isLoading } = useTweets();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment?.stats?.likes ?? 0);
  const [MenuVisible, setMenuVisible] = useState(false)

  // Replies
  const [reply, setReply] = useState<ReplyType[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [isReplied, setIsReplied] = useState(comment?.stats?.replies > 0);

  // Reply Like (for individual replies)
  const [isReplyLiked, setIsReplyLiked] = useState(false);
  const [replyLikeCount, setReplyLikeCount] = useState(0);

  // Reply input state
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

   const tweetOptions: MenuOption[] = [
  { title: "Not interested", onPress: () => console.log('Not interested in:', comment.id) },
  { title: "Report Tweet", onPress: () => console.log('Reporting:', comment.id) },
  ]
 if(user?.id === comment?.author?.id){
   tweetOptions.push({ title: "Delete Tweet", onPress: () => onDelete(comment.id), isDestructive: true })
 }

  const handleLike = async () => {
    try {
      await likeComment(comment.id);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.log("Like error:", error);
    }
  };


  const handleAddReply = () => {
    setShowReplyInput(true);
  };

 const handleToggleReply = async () => {
  if (!showReply) {
    // only fetch if empty
    if (reply.length === 0) {
      try {
        const response = await getReplyByCommentId(comment.id);
        if (response?.success && Array.isArray(response.data)) {
          setReply(response.data);
        }
      } catch (error) {
        console.log("Fetch replies error:", error);
      }
    }
    setShowReply(true);
    setShowReplyInput(false);
  } else {
    setShowReply(false);
  }
};


  const refreshReplies = async () => {
  try {
    const response = await getReplyByCommentId(comment.id);
    if (response?.success && Array.isArray(response.data)) {
      setReply(response.data);
    }
  } catch (error) {
    console.log("Refresh replies error:", error);
  }
};

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await addReply(replyText, comment.id);
      if (response?.success && response?.data) {
        // Add new reply to the list
        setReply((prev) => [response.data, ...prev]);
        setShowReply(true);
        setReplyText("");
        setShowReplyInput(false);
        setIsReplied(true);
      }
    } catch (error) {
      console.log("Reply error:", error);
    }
  };

  return (
    <View style={styles.commentItem}>
      {/* Avatar */}
      <Image
        source={{ uri: comment?.author?.avatar }}
        style={styles.commentAvatar}
      />

      <View style={styles.commentContent}>
        {/* Header */}
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment?.author?.displayName}</Text>
          <Text style={styles.commentUsername}>@{comment?.author?.username}</Text>
          <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
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

        {/* Comment Text */}
        <Text style={styles.commentText}>{comment.content}</Text>

        {/* Reply + Toggle */}
        {!showReplyInput && (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
            <TouchableOpacity onPress={handleAddReply}>
              <Text style={styles.replyActionText}>Reply</Text>
            </TouchableOpacity>

            {isReplied && (
              <TouchableOpacity onPress={handleToggleReply}>
                <Text style={styles.replyActionText}>
                  {showReply ? "Hide Replies" : "Show Replies"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <View style={styles.replyInputContainer}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder={`Replying to @${comment?.author?.username}`}
              placeholderTextColor={colors.secondaryText}
              style={styles.replyInput}
            />
            <TouchableOpacity onPress={handleSubmitReply}>
              <Text style={styles.sendButton}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowReplyInput(false);
                setReplyText("");
              }}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Replies List */}
        {showReply && (
         <FlatList
            data={reply}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <CommentReply reply={item} />}
              refreshing={isLoading}
              onRefresh={refreshReplies}
/>
        )}
      </View>

      {/* Like Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Heart
          size={18}
          fill={isLiked ? colors.danger : "transparent"}
          color={isLiked ? colors.danger : colors.lightGray}
        />
        {likeCount > 0 && (
          <Text style={[styles.actionText, isLiked && { color: colors.danger }]}>
            {likeCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  commentItem: {
    flexDirection: "row",
    padding: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  commentName: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  commentUsername: {
    fontSize: 12,
    color: colors.secondaryText,
    marginRight: 4,
  },
  commentTime: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  replyActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    alignItems: "center",
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.secondaryText,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: "600",
  },
  cancelButton: {
    marginLeft: 8,
    color: colors.danger,
    fontWeight: "600",
  },
});
