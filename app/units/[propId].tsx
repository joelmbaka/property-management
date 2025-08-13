import { useLocalSearchParams } from "expo-router";
import React from "react";
import { UnitCard } from "../../components/UnitCard";
import type { Unit } from "../../components/UnitCard";
import { BookTourModal } from "../../components/BookTourModal";
import { ImageCarousel } from "../../components/ImageCarousel";
import { FlatList, SafeAreaView, Text, View, ActivityIndicator } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAuth } from "../../lib/AuthProvider";
import { useRouter } from "expo-router";
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
  const { user } = useAuth();
  const router = useRouter();

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
        setProperty({ id: snap.id, ...(snap.data() as any), units, rentNow: (unit: Unit) => console.log('Rent now clicked for unit:', unit) } as Property);
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
            onRentNow={async (u) => {
              if (!user) {
                router.push('/login');
                return;
              }
              try {
                const endpoint = (Constants.expoConfig?.extra as any)?.apiEndpoint?.replace('/book-tour', '/create-checkout') ?? 'https://property-management-snowy-rho.vercel.app/api/create-checkout';
                const resp = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ propId, unitId: u.id, unitNumber: u.number, amount: u.rent * 100, uid: user.uid }),
                });
                const { url } = await resp.json();
                if (url) {
                  await WebBrowser.openBrowserAsync(url);
                } else {
                  alert('Unable to start checkout');
                }
              } catch (e) {
                console.error('Checkout error', e);
                alert('Checkout failed');
              }
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
