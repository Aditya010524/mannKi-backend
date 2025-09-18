import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Settings } from "lucide-react-native";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Tweet as TweetComponent } from "@/components/Tweet";
import { useAuth } from "@/hooks/useAuth";
import { useTweets } from "@/hooks/useTweets";
import { colors } from "@/constants/colors";
import { Tweet } from "@/types";
import { router } from "expo-router";
// import MediaGrid from "@/components/MediaGrid"; // 👈 for media tab

export default function ProfileScreen() {
  const { user } = useAuth();
  const {
    fetchUserTweets,
    fetchUserTweetsMedia,
    fetchLikedTweetsByUser,
    fetchMentionedTab
  } = useTweets();

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [mediaTweets, setMediaTweets] = useState<Tweet[]>([]);
  const [mentionedTweets, setMentionedTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tweets" | "media" | "likes">(
    "tweets"
  );

  // styling for tabs
  const activeTabstyle = "border-b-2 border-primary py-3";
  const inactiveTabStyle = "flex-1 items-center py-3 ";
  const inactiveTabTextStyle = "font-medium";
  const activeTabTextStyle = "text-primary";

  const loadTweets = async () => {
    if (!user) return;

    const userTweets = await fetchUserTweets(user.id);
    setTweets(userTweets);

    // const userMedia = await fetchUserTweetsMedia(user.id);
    // setMediaTweets(userMedia);

const userMentioned = await fetchMentionedTab();
setMentionedTweets(userMentioned);

    const userLikedTweet = await fetchLikedTweetsByUser(user.id);
    setLikedTweets(userLikedTweet);
  };

  useEffect(() => {
    if (user) {
      loadTweets();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTweets();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (!user) return null;

  // ✅ return correct data & renderer based on tab
  const getTabConfig = () => {
    switch (activeTab) {
      case "tweets":
        return {
          data: tweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={loadTweets} />
          ),
          emptyText: "No tweets yet",
        };
      case "media":
        return {
          data: mediaTweets,
          // renderItem: () => (
          //   <MediaGrid
          //     data={mediaTweets}
          //     onPressMedia={(tweet) => console.log("media clicked", tweet.id)}
          //   />
          // ),
          emptyText: "No media yet",
        };
      case "likes":
        return {
          data: likedTweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={loadTweets} />
          ),
          emptyText: "No likes yet",
        };
        case "mentions":
        return {
          data: mentionedTweets,
          renderItem: ({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={loadTweets} />
          ),
          emptyText: "No mentions yet",
        };
      default:
        return { data: [], renderItem: () => null, emptyText: "Nothing here" };
    }
  };

  const { data, renderItem, emptyText } = getTabConfig();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-xl font-semibold text-text">{user.displayName}</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => (item?.id ? item.id : String(index))}
        renderItem={renderItem}
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
              <TouchableOpacity
                className={`${inactiveTabStyle}  ${
                  activeTab === "mentions" ? activeTabstyle : ""
                }`}
                onPress={() => setActiveTab("mentions")}
              >
                <Text
                  className={`${inactiveTabTextStyle} ${
                    activeTab === "mentions"
                      ? activeTabTextStyle
                      : "text-secondaryText"
                  }`}
                >
                  Mentions
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="p-6 items-center">
            <Text className="text-lg font-semibold text-text mb-2">
              {emptyText}
            </Text>
            <Text className="text-center text-secondaryText text-md">
              When you post {activeTab}, they'll show up here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
