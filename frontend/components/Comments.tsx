// components/Comment.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform , Button} from "react-native";
import { Comment as CommentType } from "@/types";
import { colors } from "@/constants/colors";
import { formatDate } from "@/utils/formatDate";
import { Heart } from "lucide-react-native";
import * as Haptics from "expo-haptics";


type Props = { comment: CommentType };

export function Comment({ comment }: Props) {
  // main comment like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // reply data (use backend-provided reply if you have it; else local)
  const initialReply = (comment as any).reply ?? null;
  const [reply, setReply] = useState<any | null>(initialReply);
  const [showReply, setShowReply] = useState(Boolean(initialReply));

  // reply like state (independent from main comment)
  const [isReplyLiked, setIsReplyLiked] = useState(false);
  const [replyLikeCount, setReplyLikeCount] = useState(
    Array.isArray(initialReply?.likes) ? initialReply.likes.length : 0
  );

  const handleLike = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };

  const handleReplyLike = () => {
    if (!reply) return; // nothing to like if reply isn't shown
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsReplyLiked((prev) => {
      const next = !prev;
      setReplyLikeCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };

  const handleAddReply = () => {
    // Demo reply object (until backend is wired)
    const demo = {
      _id: Date.now().toString(),
      content: "This is a reply",
      createdAt: new Date().toISOString(),
      user: {
        name: "John Doe",
        username: "johndoe",
        profilePic : "https://res.cloudinary.com/di1e0mwbu/image/upload/v1753185517/twitter_media/g280oybc1rw1xg5c8z1j.jpg",
      },
      likes: [] as string[],
    };
    setReply(demo);
    setShowReply(true);
    setIsReplyLiked(false);
    setReplyLikeCount(0);
  };

  return (
    <View style={styles.commentItem}>
      {/* Comment Avatar */}
      <Image source={{ uri: comment.user.profilePic }} style={styles.commentAvatar} />

      {/* Comment Content */}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.user.name}</Text>
          <Text style={styles.commentUsername}>@{comment.user.username}</Text>
          <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
        </View>

        <Text style={styles.commentText}>{comment.content}</Text>

        {/* Reply / Show-Hide */}
        {reply ? (
          <TouchableOpacity onPress={() => setShowReply((s) => !s)}>
            <Text style={styles.replyActionText}>{showReply ? "Hide Reply" : "Show Reply"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleAddReply}>
            <Text style={styles.replyActionText}>Reply</Text>
          </TouchableOpacity>
        )}

        {/* Render Reply */}
        {showReply && reply && (
          <View style={styles.replyContainer}>

            <Image source={{ uri: reply.user.profilePic }} style={styles.replyAvatar} />

            <View style={styles.replyContent}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyName}>{reply.user.name}</Text>
                <Text style={styles.replyUsername}>@{reply.user.username}</Text>
                <Text style={styles.replyTime}>{formatDate(reply.createdAt)}</Text>
              </View>

              <Text style={styles.replyTextContent}>{reply.content}</Text>
            </View>

            <TouchableOpacity
              style={styles.replyLikeButton}
              onPress={handleReplyLike}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart
                size={16}
                fill={isReplyLiked ? colors.danger : "transparent"}
                color={isReplyLiked ? colors.danger : colors.lightGray}
              />
              {replyLikeCount > 0 && (
                <Text
                  style={[
                    styles.replyLikeText,
                    isReplyLiked && { color: colors.danger },
                  ]}
                >
                  {replyLikeCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Like button for main comment */}
      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Heart
          size={18}
          fill={isLiked ? colors.danger : "transparent"}
          color={isLiked ? colors.danger : colors.lightGray}
        />
        {likeCount > 0 && (
          <Text style={[styles.actionText, isLiked && { color: colors.danger }]}>{likeCount}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  commentItem: {
    flexDirection: "row",
   padding : 12,
   
  
  
    
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
    marginTop: 6,
  },

  /** --- Main like --- **/
  actionButton: {
    alignItems: "center",
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: colors.secondaryText,
  },

  /** --- Reply styles --- **/
  replyContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginLeft: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 8,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  replyName: {
    fontWeight: "600",
    fontSize: 13,
    color: colors.text,
    marginRight: 4,
  },
  replyUsername: {
    fontSize: 11,
    color: colors.secondaryText,
    marginRight: 4,
  },
  replyTime: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  replyTextContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  replyLikeButton: {
    
    alignItems: "center",
   
    paddingLeft: 6,
  },
  replyLikeText: {
    marginTop: 2,
    fontSize: 12,
    color: colors.secondaryText,
  },
});
