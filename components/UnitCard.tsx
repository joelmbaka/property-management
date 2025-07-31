import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppButton } from "./AppButton";

export interface Unit {
  id: string;
  number: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  vacant: boolean;
}

interface Props {
  unit: Unit;
  onBookTour?: (unit: Unit) => void;
  onRentNow?: (unit: Unit) => void;
}

export const UnitCard: React.FC<Props> = ({ unit, onBookTour, onRentNow }) => {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Unit {unit.number}</Text>
        <Text style={styles.meta}>
          {unit.bedrooms} bd • {unit.bathrooms} ba
        </Text>
        <Text style={styles.rent}>KES {unit.rent.toLocaleString()}</Text>
      </View>
      <View style={styles.action}>
        {unit.vacant ? (
          <View style={styles.actionRow}>
            <AppButton
              title="Book Tour"
              onPress={() => onBookTour?.(unit)}
              style={styles.smallBtn}
            />
            <AppButton
              title="Rent Now"
              variant="secondary"
              onPress={() => onRentNow?.(unit)}
              style={styles.smallBtn}
            />
          </View>
        ) : (
          <Text style={styles.occupied}>Occupied!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontWeight: "bold", marginBottom: 4, fontSize: 16 },
  meta: { marginBottom: 4, color: "#555" },

  rent: { fontWeight: "600", marginBottom: 6 },
  smallBtn: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occupied: { color: "#d32f2f", fontWeight: "bold", textAlign: 'center' },
});
