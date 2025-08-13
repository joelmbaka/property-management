import React from "react";
import { SafeAreaView, FlatList, StatusBar, View, Pressable, Text, TouchableOpacity } from "react-native";
import { PropertyCard, Property } from "../components/PropertyCard";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../lib/AuthProvider";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { Platform, useWindowDimensions } from 'react-native';
import * as Application from 'expo-application';
import { db } from "../lib/firebase";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const [bedFilter, setBedFilter] = React.useState<'all' | 2 | 3>('all');
  const [properties, setProperties] = React.useState<Property[]>([]);

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;

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
      console.log('Running package:', Application.applicationId);
      console.log('Requesting Expo push token...');
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          try {
            await setDoc(doc(db, 'deviceTokens', token), { token, uid: user?.uid ?? null, createdAt: serverTimestamp() }, { merge: true });
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
        ...(Platform.OS === 'web' ? { maxWidth: 1200, width: '100%', alignSelf: 'center' } : {}),
        padding: 16,
        paddingTop: StatusBar.currentHeight || 16,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
        {!user && (
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{ backgroundColor: "#333", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 }}
          >
            <Text style={{ color: "#fff" }}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{ marginBottom: 12 }}>Choose from our rental properties</Text>
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
          <View style={{ flex: 1, maxWidth: numColumns > 1 ? '48%' : '100%' }}>
            <Link href={{ pathname: "/units/[propId]", params: { propId: item.id } }} asChild>
              <PropertyCard property={item} />
            </Link>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
      />
    </SafeAreaView>
  );
}
