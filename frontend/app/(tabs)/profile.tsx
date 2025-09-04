import React, { use, useEffect, useState } from "react";
import {

  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Button,
} from "react-native";
import { Settings } from "lucide-react-native";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Tweet as TweetComponent } from "@/components/Tweet";
import { useAuth } from "@/hooks/useAuth";
import { useTweets } from "@/hooks/useTweets";
import { colors } from "@/constants/colors";
import { Tweet } from "@/types";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout , fetchUser } = useAuth();
  const { fetchUserTweets, isLoading } = useTweets();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "tweets" | "replies" | "media" | "likes"
  >("tweets");

  // styling for tabs

  const activeTabstyle = "border-b-2 border-primary py-3";
  const inactiveTabStyle = "flex-1 items-center py-3 ";
  const inactiveTabTextStyle = "font-medium";
  const activeTabTextStyle = "text-primary";

  const loadTweets = async () => {
    if (!user) return;

    const userTweets = await fetchUserTweets(user.id);
    setTweets(userTweets);
  };

  useEffect(() => {
    if (user) {
      loadTweets();
    }
  }, [user]);
 

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTweets();
    await fetchUser()
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (!user) return null;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-xl font-semibold text-text">{user.name}</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TweetComponent tweet={item} onRefresh={loadTweets} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <ProfileHeader
              user={user}
              isCurrentUser={true}
              onEditProfile={handleEditProfile}
            />

            <View className="flex-row border-b border-border">
              <TouchableOpacity
                className={`${inactiveTabStyle}  ${
                  activeTab === "tweets" ? activeTabstyle : ""
                }`}
            
                onPress={() => setActiveTab("tweets")}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${
                    activeTab === "tweets"
                      ? activeTabTextStyle
                      : "text-secondaryText"
                  }`}
               
                >
                  Tweets
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${inactiveTabStyle}  ${
                  activeTab === "replies" ? activeTabstyle : ""
                }`}
                onPress={() => setActiveTab("replies")}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${
                    activeTab === "replies"
                      ? activeTabTextStyle
                      : "text-secondaryText"
                  }`}
                >
                  Replies
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${inactiveTabStyle}  ${
                  activeTab === "media" ? activeTabstyle : ""
                }`}
                onPress={() => setActiveTab("media")}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${
                    activeTab === "media"
                      ? activeTabTextStyle
                      : "text-secondaryText"
                  }`}
                >
                  Media
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${inactiveTabStyle}  ${
                  activeTab === "likes" ? activeTabstyle : ""
                }`}
                onPress={() => setActiveTab("likes")}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${
                    activeTab === "likes"
                      ? activeTabTextStyle
                      : "text-secondaryText"
                  }`}
                >
                  Likes
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="p-6 items-center">
            <Text className="text-lg font-semibold text-text mb-2">
              No tweets yet
            </Text>
            <Text className="text-center text-secondaryText text-md">
              When you post tweets, they'll show up here.
            </Text>
          </View>
        }
      />
     
    </View>
  );
}
