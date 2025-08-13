import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useRouter } from 'expo-router';

export default function CheckoutCancel() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Cancelled</Text>
      <Text>The checkout was cancelled or failed.</Text>
      <AppButton title="Back" onPress={() => router.back()} style={{ marginTop: 24 }} />
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
