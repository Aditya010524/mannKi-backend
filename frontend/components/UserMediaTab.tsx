import React from "react";
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Tweet } from "@/types";

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / numColumns;

interface MediaGridProps {
  item: Tweet;
  onPressMedia?: (tweet: Tweet) => void;
}

export default function MediaGrid({ item, onPressMedia }: MediaGridProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPressMedia?.(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.url || item.thumbnail }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
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
