import { StyleSheet, Text, View, Button, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { UserCard } from '@/components/UserCard'
import { useLocalSearchParams } from "expo-router";
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '@/constants/colors';
import { useUsers } from '@/hooks/useUsers'

const Connections = () => { 
   const { UserId } = useLocalSearchParams();
   const { getFollowers, getFollowing } = useUsers();
  const [followers, setfollowers] = useState([]);
  const [following, setfollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('followers');
 
     const loadFollowers = async (UserId: any) => {
        const response = await getFollowers(UserId);
     
       
        console.log("followers",response)
        setfollowers(response)
     
      };
      
      const loadFollowing = async (UserId:any) => {
     try { const response = await getFollowing(UserId);
      console.log("following",response)
      setfollowing(response)
  
     } catch (error) {
      console.log(error)
     }
    
      }
       useEffect(() => {
        loadFollowers(UserId);
        loadFollowing(UserId);
     

      }, []);

  const data = activeTab === "followers" ? followers : following;

  // 🔥 same tab styles from ProfileScreen
  const activeTabStyle = "border-b-2 border-primary py-3";
  const inactiveTabStyle = "flex-1 items-center py-3";
  const inactiveTabTextStyle = "font-medium text-base";
  const activeTabTextStyle = "text-primary text-base font-semibold";

  return (
    <View className="flex-1 bg-background">
      {/* Tabs */}
      <View className="flex-row border-b border-border">
        <TouchableOpacity
          className={`${inactiveTabStyle} ${activeTab === "followers" ? activeTabStyle : ""}`}
          onPress={() => setActiveTab("followers")}
        >
          <Text
            className={`${inactiveTabTextStyle} ${
              activeTab === "followers" ? activeTabTextStyle : "text-secondaryText"
            }`}
          >
            Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`${inactiveTabStyle} ${activeTab === "following" ? activeTabStyle : ""}`}
          onPress={() => setActiveTab("following")}
        >
          <Text
            className={`${inactiveTabTextStyle} ${
              activeTab === "following" ? activeTabTextStyle : "text-secondaryText"
            }`}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <SafeAreaView className="flex-1">
        {data && data.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => <UserCard user={item} />}
            scrollEnabled
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-semibold text-text mb-1">
              {activeTab === "followers" ? "No Followers" : "No Following"}
            </Text>
            <Text className="text-secondaryText text-base">
              {activeTab === "followers"
                ? "You do not have any followers yet."
                : "You are not following anyone yet."}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Connections;
