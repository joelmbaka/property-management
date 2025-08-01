import React from "react";
import { SafeAreaView, FlatList, StatusBar, View, Pressable, Text } from "react-native";
import { PropertyCard, Property } from "../components/PropertyCard";
import { Link } from "expo-router";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { Platform } from 'react-native';
import { db } from "../lib/firebase";

export default function Index() {
  const [bedFilter, setBedFilter] = React.useState<'all' | 2 | 3>('all');
  const [properties, setProperties] = React.useState<Property[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "properties"));
        const props = await Promise.all(
          snap.docs.map(async (doc) => {
            const unitsSnap = await getDocs(collection(db, "properties", doc.id, "units"));
            const units = unitsSnap.docs.map((u) => ({ id: u.id, ...(u.data() as any) }));
            return { id: doc.id, ...(doc.data() as any), units } as Property;
          })
        );
        setProperties(props);
      } catch (e) {
        console.error("Failed to load properties", e);
      }
    })();
  }, []);

  // register device push token once
  React.useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      console.log('Requesting Expo push token...');
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          try {
            await setDoc(doc(db, 'deviceTokens', token), { token, createdAt: serverTimestamp() }, { merge: true });
            console.log('Push token registered', token);
          } catch (e) {
            console.error('Failed to save push token', e);
          }
        } else {
          console.warn('No push token returned');
        }
      });
    } else {
      console.log('Skip push token registration on web');
    }
  }, []);

  const filtered = bedFilter === 'all' ? properties : properties.filter((p) =>
    p.units.some((u) => (u.bedrooms === bedFilter))
  );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        paddingTop: StatusBar.currentHeight || 16,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Welcome to Mombasa Homes. Choose from our rental properties
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {(
          [
            { label: 'All', value: 'all' },
            { label: '2 Bedroom', value: 2 },
            { label: '3 Bedroom', value: 3 },
          ] as const
        ).map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setBedFilter(opt.value)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: bedFilter === opt.value ? "#333" : "#e0e0e0",
            }}
          >
            <Text style={{ color: bedFilter === opt.value ? "#fff" : "#000" }}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/units/[propId]", params: { propId: item.id } }} asChild>
            <PropertyCard property={item} />
          </Link>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
