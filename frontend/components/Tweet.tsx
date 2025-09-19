import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, Image, TouchableOpacity, Platform } from 'react-native';
import { Heart, MessageCircle, Repeat, Share2, MoreVertical, Repeat2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Tweet as TweetType } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTweets } from '@/hooks/useTweets';
import * as Haptics from 'expo-haptics';
import Grid from '@/components/Grid';
import OptionsMenu, { MenuOption } from '@/components/OptionsMenuModal';

interface TweetProps {
  tweet: TweetType;
  onRefresh?: () => void;
}

export const Tweet: React.FC<TweetProps> = ({ tweet, onRefresh }) => {
    //If it's a retweet, render originalTweet instead 
  const displayTweet = tweet.type === 'retweet' ? tweet.originalTweet : tweet;
  const { user : currentUser } = useAuth();
  const { likeTweet, retweet, deleteTweet } = useTweets();
  const [isLiked, setIsLiked] = useState(tweet?.isLiked);
  const [likeCount, setLikeCount] = useState(displayTweet?.stats?.likes);
  const [isRetweeted, setIsRetweeted] = useState(tweet?.isRetweeted);
  const [retweetCount, setRetweetCount] = useState(displayTweet?.stats?.retweets);
  const [MenuVisible, setMenuVisible] = useState(false);

  const tweetOptions: MenuOption[] = [
    { title: 'Not interested', onPress: () => console.log('Not interested in:', tweet.id) },
    { title: 'Report Tweet', onPress: () => console.log('Reporting:', tweet.id) },
  ];
  if (currentUser?.id === tweet?.author?.id) {
    tweetOptions.push({ title: 'Delete Tweet', onPress: () => deleteTweet(tweet.id), isDestructive: true });
  }

useEffect(() => {
  setIsLiked(tweet?.isLiked);
  console.log(isLiked)
  setLikeCount(displayTweet?.stats?.likes);
  setIsRetweeted(tweet?.isRetweeted);
  setRetweetCount(displayTweet?.stats?.retweets);
}, [tweet]);

  const handleLike = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    await likeTweet(displayTweet.id);
    if (onRefresh) onRefresh();
  };

  const handleRetweet = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRetweeted(!isRetweeted);
    setRetweetCount(isRetweeted ? retweetCount - 1 : retweetCount + 1);
    if(tweet.type === 'retweet') {
      await retweet(tweet.originalTweet.id);
       console.log("retweet")
    } else if(tweet.type === 'original') {
      await retweet(tweet.id);
      console.log("original")
    }
   
    if (onRefresh) onRefresh();
  };

  const handleComment = () => {
  if(tweet.type === 'retweet') {
  router.push(`/tweet/${tweet.originalTweet.id}`);
}
else if(tweet.type === 'original') {
    router.push(`/tweet/${tweet.id}`);
}
  };

  const handleShare = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

 const navigateToProfile = () => { 
  const id = tweet?.author?.id;
console.log(id)
console.log(currentUser?.id)
  if (id === currentUser?.id) {
    // go to self profile
    router.push('/(tabs)/profile');
  } else if (id) {
    // go to other user profile
    router.push(`/profile/${id}`);
  } else {
    console.warn("No author id found in tweet");
  }
};


  const navigateToTweet = () => {
if(tweet.type === 'retweet') {
  router.push(`/tweet/${tweet.originalTweet.id}`);
}
else if(tweet.type === 'original') {
    router.push(`/tweet/${tweet.id}`);
}
  };
  
  return (
    <Pressable className="flex-row border-b border-border bg-background px-4 py-3" onPress={navigateToTweet}>
      <View className="flex-1">
        {/* Retweet banner */}
        {tweet.type === 'retweet' && tweet.retweetInfo && (
          <TouchableOpacity
            className="flex-row items-center mb-3 ml-12"
            onPress={() => navigateToProfile(tweet.retweetInfo.retweetedBy.id)}
          >
            <Repeat2 size={16} color={colors.secondaryText} className="mr-1" />
            <Image
              source={{ uri: tweet.retweetInfo.retweetedBy.avatar }}
              className="w-6 h-6 rounded-full mr-1 ml-1"
            />
            <Text className="text-xs text-gray-500 font-semibold">
              {tweet.retweetInfo.retweetedBy.displayName}
            </Text>
            <Text className="text-xs text-gray-400 ml-1">
              @{tweet.retweetInfo.retweetedBy.username} Retweeted
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row">
          {/* Avatar */}
          <TouchableOpacity onPress={() => navigateToProfile(displayTweet?.author?.id)}>
            <Image source={{ uri: displayTweet?.author?.avatar }} className="w-12 h-12 rounded-full mr-3" />
          </TouchableOpacity>

          <View className="flex-1">
            {/* Header */}
            <View className="flex-row flex-wrap items-center mb-1">
              <TouchableOpacity onPress={() => navigateToProfile(displayTweet?.author?.id)}>
                <Text className="font-bold text-base text-foreground mr-1">
                  {displayTweet?.author?.displayName}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToProfile(displayTweet?.author?.id)}>
                <Text className="text-sm text-muted-foreground">@{displayTweet?.author?.username}</Text>
              </TouchableOpacity>
              <Text className="text-sm text-muted-foreground mx-1">·</Text>
              <Text className="text-sm text-muted-foreground">{formatDate(displayTweet.createdAt)}</Text>
              <TouchableOpacity className="ml-auto" onPress={() => setMenuVisible(true)}>
                <MoreVertical size={18} color={colors.lightGray} />
              </TouchableOpacity>
              {MenuVisible && (
                <OptionsMenu MenuVisible={MenuVisible} onClose={() => setMenuVisible(false)} options={tweetOptions} />
              )}
            </View>

            {/* Content */}
            <Text className="text-base text-foreground mb-2">{displayTweet.content}</Text>

            {/* Media */}
            {displayTweet?.media && displayTweet?.media?.length > 0 && (
              <Grid
                photos={displayTweet?.media.map((media) => media?.url)}
                isLiked={isLiked}
                onLike={handleLike}
                likeCount={likeCount}
              />
            )}

            {/* Actions */}
            <View className="flex-row justify-between mr-8 mt-2">
              <TouchableOpacity className="flex-row items-center" onPress={handleComment}>
                <MessageCircle size={18} color={colors.lightGray} />
                {displayTweet?.comments?.length > 0 && (
                  <Text className="ml-1 text-sm text-muted-foreground">{displayTweet?.stats?.comments}</Text>
                )}
              </TouchableOpacity>

              {displayTweet?.author?.id !== currentUser?.id && (
                <TouchableOpacity className="flex-row items-center" onPress={handleRetweet}>
                  <Repeat size={18} color={isRetweeted ? colors.success : colors.lightGray} />
                  {retweetCount > 0 && (
                    <Text
                      className={`ml-1 text-sm ${isRetweeted ? 'text-green-500' : 'text-muted-foreground'}`}
                    >
                      {retweetCount}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity className="flex-row items-center" onPress={handleLike}>
                <Heart
                  size={18}
                  fill={isLiked ? colors.danger : 'transparent'}
                  color={isLiked ? colors.danger : colors.lightGray}
                />
                {likeCount > 0 && (
                  <Text className={`ml-1 text-sm ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {likeCount}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center" onPress={handleShare}>
                <Share2 size={18} color={colors.lightGray} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
