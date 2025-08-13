import React from "react";
import { Image, Pressable, StyleSheet, Text, View, Platform } from "react-native";

export type Unit = {
  id: string;
  number: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  vacant: boolean;
};

export type Property = {
  id: string;
  name: string;
  location: string;
  type: "apartment" | "compound";
  imageUrl?: string;
  units: Unit[];
  description?: string;
};

interface Props {
  property: Property;
  onPress?: () => void;
}

export const PropertyCard: React.FC<Props> = ({ property, onPress }) => {
  const vacant = property.units.filter((u) => u.vacant).length;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: property.imageUrl ?? "https://picsum.photos/seed/property/600/400" }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{property.name}</Text>
        <Text style={styles.location}>{property.location}</Text>
        <Text style={styles.meta}>
          {property.type.toUpperCase().replace("COMPOUND", "COMPOUND HOUSE")} • {vacant}/{property.units.length} vacant
        </Text>
      </View>
    </Pressable>
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
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
