import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Button, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Tweet as TweetComponent } from '@/components/Tweet';
import { useTweets } from '@/hooks/useTweets';
import { colors } from '@/constants/colors';
import { Tweet,  } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Comment } from '@/components/Comments';


export default function TweetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchTweetById, addComment, isLoading } = useTweets();
  const { user } = useAuth();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // dummy data state
  const [DummyComments, setDummyComments] = useState<Comment[]>([]);
  
  const loadTweet = async () => {
    if (!id) return;
    
    const tweetData = await fetchTweetById(id);
    if (tweetData) {
      setTweet(tweetData);
     
    }
  };
   const fetchDummyComments = async () => {
  try {
    const res = await fetch("https://dummyjson.com/c/ce05-96e8-4d0a-b686");
    if (!res) throw new Error("Failed to fetch data");

    const data = await res.json();
   const dummyData = data.data
    setDummyComments(dummyData);
   
    console.log("Dummy response is :", dummyData);
    return data;
  } catch (error) {
    console.error("Error fetching dummy comments:", error);
    return [];
  }
};
  
  useEffect(() => {
    loadTweet();
    fetchDummyComments();
    
  }, [id]);
  
  const handleAddComment = async () => {
    if (!tweet || !user || !commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedTweet = await addComment(tweet.id, commentText);
      if (updatedTweet) {
        setTweet(updatedTweet);
        setCommentText('');
            //  console.log('and tweet is from this component', tweet);
            //  console.log('and tweet.comment from this component is', tweet.comments);
            //  console.log('tweet lenth is',tweet.comments.length);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!tweet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading tweet...</Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.main_container} edges={['bottom']}>
      <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tweetContainer}>
          <View style={styles.tweetHeader}>
            <Image source={{ uri: tweet.user.profilePic }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{tweet.user.name}</Text>
              <Text style={styles.username}>@{tweet.user.username}</Text>
            </View>
          </View>
          
          <Text style={styles.tweetContent}>{tweet.content}</Text>
          
          {tweet.media && tweet.media.length > 0 && (
            <Image source={{ uri: tweet.media[0] }} style={styles.media} />
          )}
          
          <Text style={styles.timestamp}>
            {new Date(tweet.createdAt).toLocaleTimeString()} · {new Date(tweet.createdAt).toLocaleDateString()}
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tweet.retweets.length}</Text>
              <Text style={styles.statLabel}>Retweets</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tweet.likes.length}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
          
          {/* <View style={styles.actionsContainer}>
            <TweetComponent tweet={tweet} onRefresh={loadTweet} />
          </View> */}
        </View>
        
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {/* {tweet.comments.length === 0 ? (
  <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
) : (
  tweet.comments.map((comment) => (
    <Comment key={comment.id} comment={comment} />
  ))
)} */}

       {DummyComments.comments.length === 0 ? (
  <Text style={styles.noCommentsText}>
    No comments yet. Be the first to comment!
  </Text>
) : (
  <FlatList
    data={DummyComments.comments}
    keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
    renderItem={({ item }) => <Comment comment={item} />}
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled = {true}
    
  />
)}

          {/* Uncomment this section if you want to use the original tweet comments instead of dummy data */}
          
          
          {/* {tweet.comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          ) : (
            tweet.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.user.profilePic }} style={styles.commentAvatar} />
                
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentName}>{comment.user.name}</Text>
                    <Text style={styles.commentUsername}>@{comment.user.username}</Text>
                    <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                  </View>
                  
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <TouchableOpacity>
                    <Text style={styles.replyText}>Reply</Text>
                  </TouchableOpacity>
                </View>
                  <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart 
              size={18} 
              fill={isLiked ? colors.danger : 'transparent'} 
              color={isLiked ? colors.danger : colors.lightGray} 
            />
            {likeCount > 0 && (
              <Text 
                style={[
                  styles.actionText, 
                  isLiked && { color: colors.danger }
                ]}
              >
                {likeCount}
              </Text>
            )} 
            
          </TouchableOpacity>
              </View>
            )
          ))} */}

          {/* {DummyComments.map((comment)=> (
            <View>
              <Text>{comment.content}</Text>
            </View>
          ))} */}
            
        </View>
      </ScrollView>
      
      {user && (
        <View style={styles.inputContainer}>
          <Image source={{ uri: user.profilePic }} style={styles.inputAvatar} />
          
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.secondaryText}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          
    {/* <Button title='press me' onPress={fetchDummyComments}/>
    <Button title='know prop' onPress={()=>console.log(DummyComments[0]._id)}/> */}
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || isSubmitting) && styles.disabledButton,``
            ]}
            onPress={handleAddComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            <Text style={styles.sendButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  tweetContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  username: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  tweetContent: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 24,
  },
  statValue: {
    fontWeight: '700' as const,
    color: colors.text,
    marginRight: 4,
  },
  statLabel: {
    color: colors.secondaryText,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  commentsContainer: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  noCommentsText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginVertical: 24,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  commentName: {
    fontWeight: '700' as const,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: colors.extraLightGray,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  sendButtonText: {
    color: colors.background,
    fontWeight: '700' as const,
    fontSize: 14,
  },
   actionButton: {
    
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.secondaryText,
  },
  replyText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 4,
  },
});