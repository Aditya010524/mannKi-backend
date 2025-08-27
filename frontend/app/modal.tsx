import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { ThumbsUp,  Share2 ,Heart } from "lucide-react-native";


const { width, height } = Dimensions.get("window");

export default function ModalScreen({ photos, showModal, setshowModal ,isLiked, onLike , likeCount}: any) {
  const [CurrentIndex, setCurrentIndex] = useState(0);


  return (
    <Modal transparent={true} visible={showModal} animationType="slide">
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setshowModal(false)}
        >
          <ArrowLeft size={28} color="#fff" />
        </TouchableOpacity>

        {/* Horizontal FlatList */}
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <View className="justify-center items-center" >
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />

        {/* Footer / Counter */}
        <View  className="position-absolute w-full items-center">
          <Text className="text-white text-xl" >
            {CurrentIndex + 1} / {photos.length}
          </Text>
         
        </View>
        {
          likeCount !== 0 ? 
     <View className="flex-row items-center px-4 py-2">
  <Heart size={14} color="#ef4444" fill="#ef4444" /> 
  <Text className="ml-2 text-gray-400 text-sm">
    Liked by <Text className="font-medium text-white">{likeCount}</Text> {likeCount === 1 ? "person" : "people"}
  </Text>
</View>
: null
        }

        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <View className="flex-row justify-around p-4 border-t border-gray-700">
          <TouchableOpacity
           onPress={onLike}
            className="flex-row justify-center items-center gap-2 w-half h-half"
          >
            <Text className="text-white">{isLiked ? "Liked" : "Like"}</Text>

            <ThumbsUp
              size={20}
              color={isLiked ? "#1DA1F2" : "white"} // stroke color
              fill={isLiked ? "#1DA1F2" : "none"} // fill when liked
              stroke={isLiked ? "#1DA1F2" : "white"} // border effect
              strokeWidth={2}
            />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-center items-center gap-2 w-half h-half">
            <Text className="text-white">Share</Text>
            <Share2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height: "80%",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  
  },
  counter: {
    color: "white",
    fontSize: 16,
  },
});
