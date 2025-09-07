import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,

} from "react-native";
import { MapPin, Link, Calendar} from "lucide-react-native";
import { User } from "@/types";
import { useUsers } from "@/hooks/useUsers";
import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isCurrentUser,
  onEditProfile,
}) => {
  const { user: currentUser } = useAuth();
  const {toggleFollow} = useUsers();
  const [isFollowing, setisFollowing] = useState(user?.followStatus?.isFollowing || true);
  

useEffect(() => {
  setisFollowing(user?.followStatus?.isFollowing || true);
}, [user?.followStatus?.isFollowing]);

  const handleFollow = async () => {


   try{
     const response = await toggleFollow(user.id);
    if(response.success){
      console.log(response?.success)
      console.log(response?.data.action)
  if (response?.data?.action === "followed") {
   setisFollowing(true);
  } else if (response?.data?.action === "unfollowed") {
    setisFollowing(false);
  } 
  }
  
    
   } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  
   }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  };

  return (
    <View className="bg-background" >
      <Image source={{ uri: user.coverPhoto }} className="w-full h-[150px]" />

      <View className="flex-row justify-between px-4 mt-[-40px]">
        <Image source={{ uri: user.avatar }} className="w-[80px] h-[80px] rounded-full border-1 border-background" />

        {isCurrentUser ? (
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Text className="text-text font-bold">Edit profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="p-5">
        <Text className="text-text font-bold text-2xl">{user.displayName}</Text>
        <Text className="text-secondaryText text-md my-1">@{user.username}</Text>

        <Text className="text-Text text-lg my-1">{user.bio}</Text>

        <View className="mb-3">
          {user.location && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.secondaryText} />
              <Text style={styles.detailText}>{user.location}</Text>
            </View>
          )}

          {user.website && (
            <View style={styles.detailItem}>
              <Link size={16} color={colors.secondaryText} />
              <Text style={[styles.detailText, styles.link]}>
                {user.website}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-1" >
            <Calendar size={16} color={colors.secondaryText} />
            <Text className="text-secondaryText text-md">{formatDate(user.createdAt)}</Text>
          </View>
        </View>

        <View className="flex-row border-t border-border pt-3">
          <TouchableOpacity
           className="mr-5 flex-row"
           onPress={()=> router.push({pathname: '/Connections', params: {type: 'userId', UserId: user.id}})}
        
          >
            <Text className="text-text font-bold mr-1">{user.followingCount}</Text>
            <Text className="text-secondaryText">Following</Text>
          </TouchableOpacity>

          <TouchableOpacity     onPress={()=> router.push({pathname: '/Connections', params: {type: 'userId', UserId: user.id}})}
          className="flex-row">
            <Text className="text-text font-bold mr-1">{user.followersCount}</Text>
            <Text className="text-secondaryText">Followers</Text>
            
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({

  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  editButtonText: {
    fontWeight: "700" as const,
    color: colors.text,
  },
  followButton: {
    backgroundColor: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    fontWeight: "700" as const,
    color: colors.background,
  },
  followingButtonText: {
    color: colors.text,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 4,
  },
  link: {
    color: colors.primary,
  },
});
