import { StyleSheet, Text, View, Button, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { UserCard } from '@/components/UserCard'
import { useLocalSearchParams } from "expo-router";
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '@/constants/colors';
// import { useUsers } from '@/hooks/useUsers'

const Connections = () => {
  //  const { userId, UserId } = useLocalSearchParams();
  //    const { getFollowers, getFollowing } = useUsers();
  const [followers, setfollowers] = useState([]);
  const [following, setfollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('followers');
 
     const loadFollowers = async () => {
        // const followers = await getFollowers(userId);
        const response = await fetch ('https://dummyjson.com/c/776f-e411-44e2-baa9')
        const followers = await response.json();
        setfollowers(followers);
        console.log(followers)
        return followers;
      };
      
      const loadFollowing = async () => {
       const response = await fetch ('https://dummyjson.com/c/9b56-12f5-4740-81ef')
       const following = await response.json();
       setfollowing(following);
      }
       useEffect(() => {
        loadFollowers();
        loadFollowing();
      }, []);

  return (
    <View>
     
      <View style={styles.tabsContainer}>
                   <TouchableOpacity
                     style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
                     onPress={() => setActiveTab('followers')}
                   >
                     <Text
                       style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}
                     >
                       Followers
                     </Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity
                     style={[styles.tab, activeTab === 'following' && styles.activeTab]}
                     onPress={() => setActiveTab('following')}
                   >
                     <Text
                       style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}
                     >
                       Following
                     </Text>
                   </TouchableOpacity>
      </View>
     
   
    <SafeAreaView>
        <FlatList 
      data={activeTab === 'followers' ? followers : following}
      keyExtractor={(item)=>item.id.toString()}
      renderItem={({item})=><UserCard user={item} />}
      scrollEnabled = {true}
      />
    </SafeAreaView>
     
    </View>
  )
      }

export default Connections

const styles = StyleSheet.create({
 

  
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.secondaryText,
  },
  activeTabText: {
    color: colors.primary,
  },
})