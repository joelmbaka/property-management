import { useLocalSearchParams } from "expo-router";
import React from "react";
import { UnitCard } from "../../components/UnitCard";
import type { Unit } from "../../components/UnitCard";
import { BookTourModal } from "../../components/BookTourModal";
import { ImageCarousel } from "../../components/ImageCarousel";
import { FlatList, SafeAreaView, Text, View, ActivityIndicator } from "react-native";
import { Property } from "../../components/PropertyCard";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function UnitsScreen() {
  const { propId } = useLocalSearchParams<{ propId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    (async () => {
      if (!propId) return;
      try {
        const docRef = doc(db, "properties", propId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          setProperty(null);
          setLoading(false);
          return;
        }
        const unitsSnap = await getDocs(collection(db, "properties", propId, "units"));
        const units = unitsSnap.docs.map((u) => ({ id: u.id, ...(u.data() as any) }));
        setProperty({ id: snap.id, ...(snap.data() as any), units } as Property);
      } catch (e) {
        console.error("Failed to load property", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Property not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={property.units}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <UnitCard
            unit={item}
            onBookTour={(u) => {
              setSelectedUnit(u);
              setModalVisible(true);
            }}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <ImageCarousel images={(property as any).images ?? ["https://picsum.photos/seed/placeholder/800/400"]} />
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
                {property.name}
              </Text>
              {property.description && (
                <Text style={{ color: "#555" }}>{property.description}</Text>
              )}
            </View>
          </>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    <BookTourModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        propId={property!.id}
        unit={selectedUnit}
      />
    </SafeAreaView>
  );
}
