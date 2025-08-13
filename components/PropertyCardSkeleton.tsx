import React from "react";
import { StyleSheet, View, Platform } from "react-native";

/**
 * Skeleton placeholder shown while property data is loading.
 * We mimic the same card layout as `PropertyCard` but replace the
 * actual content with grey blocks.
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.info}>
        <View style={[styles.textPlaceholder, { width: "60%" }]} />
        <View style={[styles.textPlaceholder, { width: "40%", marginTop: 6 }]} />
        <View style={[styles.textPlaceholder, { width: "50%", marginTop: 6 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
    }),
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#e0e0e0",
  },
  info: {
    padding: 12,
  },
  textPlaceholder: {
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
});
