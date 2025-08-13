import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthProvider';
import { AppButton } from '../components/AppButton';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // After a brief delay redirect to the relevant dashboard
    const t = setTimeout(() => {
      if (user) {
        router.replace(isAdmin ? '/admin' : '/tenant');
      } else {
        router.replace('/');
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Successful 🎉</Text>
      <Text>Your rent payment has been received.</Text>
      <AppButton title="Go Home" onPress={() => router.replace('/')} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
