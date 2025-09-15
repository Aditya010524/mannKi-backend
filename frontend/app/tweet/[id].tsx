import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTweets } from "@/hooks/useTweets";
import { colors } from "@/constants/colors";
import { Tweet } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Comment } from "@/components/Comments";
import { router } from "expo-router";
import { Button } from "@/components/Button";

export default function TweetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchTweetById, addComment, fetchCommentsByTweetId ,deleteComment } = useTweets();
  const { user } = useAuth();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setcomments] = useState<Comment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handlerefresh = async () => {
    setRefreshing(true);
    await loadTweet();
    setRefreshing(false);
  };

  const loadTweet = async () => {
    if (!id) return;
    const tweetData = await fetchTweetById(id);
    if (tweetData) setTweet(tweetData);
  };

  const Comments = async () => {
    try {
      const response = await fetchCommentsByTweetId(tweet.id);
  
// console.log("comments",response.data)
      setcomments(response.data);
    } catch (error) {
      console.error("Error fetching dummy comments:", error);
    }
  };

  useEffect(() => {
    if (id) {
      loadTweet();
    }
  }, [id]);

  useEffect(() => {
    if (tweet?.id) {
      Comments(tweet.id);
    }
  }, [tweet]);

  const handleNavigate = () => {
    router.push(`/profile/${tweet?.author?.id}`);
  };

  const handleAddComment = async () => {
    if (!tweet || !user || !commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const updatedComment = await addComment(tweet.id, commentText);
      if (updatedComment) {
        console.log("Updated comment:");
        setcomments((prev) => [updatedComment, ...prev]);
        setCommentText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tweet) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading tweet...</Text>
      </View>
    );
  }
const handleDeleteComment = async (commentId: string) => {
  try {
    await deleteComment(commentId);
    setcomments((prev) => prev.filter((comment) => comment.id !== commentId));
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => handlerefresh()}
            />
          }
          data={comments}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => <Comment comment={item} onDelete={handleDeleteComment} />}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          ListHeaderComponent={
            <View className="p-4 border-b border-gray-200">
              {/* Tweet header */}
              <TouchableOpacity
                className="flex-row items-center mb-3"
                onPress={() => handleNavigate()}
              >
                <Image
                  source={{ uri: tweet?.author?.avatar }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View>
                  <Text className="text-xl font-bold text-black">
                    {tweet?.author?.displayName}
                  </Text>
                  <Text className="text-m text-gray-500">
                    @{tweet?.author?.username}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Tweet content */}
              <Text className="text-lg leading-6 text-black mb-3">
                {tweet.content}
              </Text>

              {/* Tweet media - horizontal scroll */}
              {tweet?.media && tweet?.media?.length > 0 && (
                <FlatList
                  data={tweet?.media}
                  keyExtractor={(item) => item?.id} // safer than index
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item?.url }}
                      className="w-[360] h-60 rounded-xl mr-2 mb-3"
                      alt={item?.altText || "tweet media"}
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}

              {/* Timestamp */}
              <Text className="text-sm text-gray-500 mb-3">
                {new Date(tweet?.createdAt).toLocaleTimeString()} ·{" "}
                {new Date(tweet?.createdAt).toLocaleDateString()}
              </Text>

              {/* Stats */}
              <View className="flex-row border-y border-gray-200 py-3 mb-3">
                <View className="flex-row mr-6">
                  <Text className="font-bold text-black mr-1">
                    {tweet?.stats?.retweets}
                  </Text>
                  <Text className="text-gray-500">Retweets</Text>
                </View>
                <View className="flex-row">
                  <Text className="font-bold text-black mr-1">
                    {tweet?.stats?.likes}
                  </Text>
                  <Text className="text-gray-500">Likes</Text>
                </View>
              </View>

              {/* Comments title */}
              <Text className="text-lg font-bold text-black">Comments</Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="text-gray-500 text-center my-6">
              No comments yet. Be the first to comment!
            </Text>
          }
        />

        {/* Input for new comment */}
        {user && (
          <View className="flex-row items-center p-3 border-t border-gray-200 bg-white">
            <Image
              source={{ uri: user?.profilePic }}
              className="w-8 h-8 rounded-full mr-2"
            />
            <TextInput
              className="flex-1 min-h-[36px] max-h-[100px] bg-gray-100 rounded-full px-3 py-2 text-sm text-black"
              placeholder="Add a comment..."
              placeholderTextColor={colors.secondaryText}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              className={`ml-2 rounded-full px-3 py-1 ${
                !commentText.trim() || isSubmitting
                  ? "bg-gray-300"
                  : "bg-blue-500"
              }`}
              onPress={handleAddComment}
              disabled={!commentText.trim() || isSubmitting}
            >
              <Text className="text-white font-bold text-sm">Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
