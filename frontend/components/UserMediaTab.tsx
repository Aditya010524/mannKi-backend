import React from "react";
import {
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Tweet } from "@/types";

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / numColumns;

interface MediaGridProps {
  data: Tweet[];
  onPressMedia?: (tweet: Tweet) => void; // optional if you want click behavior
}

export default function MediaGrid({ data, onPressMedia }: MediaGridProps) {
  const renderItem = ({ item }: { item: Tweet }) => {
    if (!item.media?.length) return null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onPressMedia?.(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.media[0].thumbnail || item.media[0].url }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    width: itemSize,
    height: itemSize,
    margin: 1,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
