import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import ModalScreen from "@/app/modal";

type GridProps = {
  photos: string[];
};

const Grid: React.FC<GridProps> = ({ photos }) => {
  // State to toggle modal visibility
  const [showModal, setShowModal] = useState(false);

  // Early exit if no photos
  if (!photos || photos.length === 0) return null;

  // Handles photo press → opens modal
  const handlePress = () => {
    setShowModal(true);
  };

  // Placeholder for grid layout (will vary depending on photos.length)
  let gridContent = null;

  // Case 1 → Single large image
  if (photos.length === 1) {
    gridContent = (
      <TouchableOpacity onPress={handlePress}>
        <Image style={styles.singleImage} source={{ uri: photos[0] }} />
      </TouchableOpacity>
    );
  }
  // Case 2 → Two side-by-side
  else if (photos.length === 2) {
    gridContent = (
      <View style={styles.row}>
        {photos.map((uri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.halfContainer}
            onPress={handlePress}
          >
            <Image style={styles.fullImage} source={{ uri }} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
  // Case 3 → One big left + two stacked right
  else if (photos.length === 3) {
    gridContent = (
      <View style={styles.row}>
        <TouchableOpacity style={styles.leftBig} onPress={handlePress}>
          <Image style={styles.fullImage} source={{ uri: photos[0] }} />
        </TouchableOpacity>
        <View style={styles.rightColumn}>
          {photos.slice(1, 3).map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={styles.halfHeight}
              onPress={handlePress}
            >
              <Image style={styles.fullImage} source={{ uri }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  // Case 4 → Perfect 2x2 grid
  else if (photos.length === 4) {
    gridContent = (
      <View style={styles.grid}>
        {photos.map((uri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridItem}
            onPress={handlePress}
          >
            <Image style={styles.fullImage} source={{ uri }} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Final return → Always render grid + modal once
  return (
    <>
      {gridContent}

      {/* Modal is conditionally shown only when clicked */}
      {showModal && (
        <ModalScreen
          photos={photos}
          showModal={showModal}
          setshowModal={setShowModal}
        />
      )}
    </>
  );
};

export default Grid;

const styles = StyleSheet.create({
  singleImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 10,
  },
  halfContainer: {
    flex: 1,
    height: 200,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  leftBig: {
    flex: 1,
    height: 200,
    marginRight: 5,
  },
  rightColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  halfHeight: {
    flex: 1,
    marginBottom: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 10,
  },
  gridItem: {
    width: "48%",
    height: 150,
  },
});
