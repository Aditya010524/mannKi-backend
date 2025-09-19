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
import MediaGrid from "@/components/UserMediaTab";

export default function ProfileScreen() {
  const { user, fetchUser } = useAuth();
  const {
    fetchUserTweets,
    fetchUserTweetsMedia,
    fetchLikedTweetsByUser,
    fetchMentionedTab,
  } = useTweets();

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [mediaTweets, setMediaTweets] = useState<Tweet[]>([]);
  const [mentionedTweets, setMentionedTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "tweets" | "media" | "likes" | "mentions"
  >("tweets");
  const [loading, setLoading] = useState<Record<string, boolean>>({
    tweets: false,
    media: false,
    likes: false,
    mentions: false,
  });

  const activeTabstyle = "border-b-2 border-primary py-3";
  const inactiveTabStyle = "flex-1 items-center py-3 ";
  const inactiveTabTextStyle = "font-medium";
  const activeTabTextStyle = "text-primary";

  // ---- Loaders ----
  const loadTweets = async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, tweets: true }));
    const userTweets = await fetchUserTweets(user.id);
    setTweets(userTweets);
    setLoading((prev) => ({ ...prev, tweets: false }));
  };

  const loadMedia = async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, media: true }));
    const userMedia = await fetchUserTweetsMedia(user.id);
    setMediaTweets(userMedia.media);
    setLoading((prev) => ({ ...prev, media: false }));
  };

  const loadLikes = async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, likes: true }));
    const userLikedTweet = await fetchLikedTweetsByUser(user.id);
    setLikedTweets(userLikedTweet);
    setLoading((prev) => ({ ...prev, likes: false }));
  };

  const loadMentions = async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, mentions: true }));
    const userMentioned = await fetchMentionedTab();
    setMentionedTweets(userMentioned);
    setLoading((prev) => ({ ...prev, mentions: false }));
  };

  // ---- On mount -> only tweets ----
  useEffect(() => {
    if (user) {
      loadTweets();
    }
  }, [user]);

  // ---- On tab switch -> load lazily ----
  useEffect(() => {
    if (!user) return;

    if (activeTab === "media" && mediaTweets.length === 0) {
      loadMedia();
    } else if (activeTab === "likes" && likedTweets.length === 0) {
      loadLikes();
    } else if (activeTab === "mentions" && mentionedTweets.length === 0) {
      loadMentions();
    }
  }, [activeTab, user]);

  // ---- Pull to refresh -> refresh only active tab ----
  const handleRefresh = async () => {
    fetchUser();
    setRefreshing(true);

    if (activeTab === "tweets") {
      await loadTweets();
    } else if (activeTab === "media") {
      await loadMedia();
    } else if (activeTab === "likes") {
      await loadLikes();
    } else if (activeTab === "mentions") {
      await loadMentions();
    }

    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (!user) return null;

  const renderTabs = () => (
    <View className="flex-row border-b border-border">
      {[
        { key: "tweets", label: "Tweets" },
        { key: "media", label: "Media" },
        { key: "likes", label: "Likes" },
        { key: "mentions", label: "Mentions" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={`${inactiveTabStyle} ${
            activeTab === tab.key ? activeTabstyle : ""
          }`}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text
            className={`${inactiveTabTextStyle} ${
              activeTab === tab.key ? activeTabTextStyle : "text-secondaryText"
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-xl font-semibold text-text">
          {user.displayName}
        </Text>
        <TouchableOpacity onPress={handleSettings}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tweets / Likes / Mentions */}
      {activeTab !== "media" ? (
        <FlatList
          data={
            activeTab === "tweets"
              ? tweets
              : activeTab === "likes"
              ? likedTweets
              : mentionedTweets
          }
          keyExtractor={(item, index) => (item?.id ? item.id : String(index))}
          renderItem={({ item }: { item: Tweet }) => (
            <TweetComponent tweet={item} onRefresh={handleRefresh} />
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
              {renderTabs()}
            </>
          }
          ListEmptyComponent={
            loading[activeTab] ? (
              <View className="p-6 items-center">
                <Text className="text-lg font-semibold text-text">
                  Loading...
                </Text>
              </View>
            ) : (
              <View className="p-6 items-center">
                <Text className="text-lg font-semibold text-text mb-2">
                  {activeTab === "tweets"
                    ? "No tweets yet"
                    : activeTab === "likes"
                    ? "No likes yet"
                    : "No mentions yet"}
                </Text>
                <Text className="text-center text-secondaryText text-md">
                  When you post {activeTab}, they'll show up here.
                </Text>
              </View>
            )
          }
        />
      ) : (
        // ✅ Media tab also uses FlatList
        <FlatList
          data={mediaTweets}
          keyExtractor={(item, index) => (item?.id ? item.id : String(index))}
          numColumns={3}
          key={`media-${3}`}
          renderItem={({ item }) => (
            <MediaGrid
              item={item}
              onPressMedia={(media) => console.log("media clicked", media.id)}
            />
          )}
          ListHeaderComponent={
            <>
              <ProfileHeader
                user={user}
                isCurrentUser={true}
                onEditProfile={handleEditProfile}
              />
              {renderTabs()}
            </>
          }
          ListEmptyComponent={
            loading.media ? (
              <View className="p-6 items-center">
                <Text className="text-lg font-semibold text-text">
                  Loading...
                </Text>
              </View>
            ) : (
              <View className="p-6 items-center">
                <Text className="text-lg font-semibold text-text mb-2">
                  No media yet
                </Text>
                <Text className="text-center text-secondaryText text-md">
                  When you post media, they'll show up here.
                </Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}
