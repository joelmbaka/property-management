import React from "react";
import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
import { PaymentHistory } from "../../components/PaymentHistory";
import { useAuth } from "../../lib/AuthProvider";

export default function TenantAccount() {
  const router = useRouter();
  const { logout, user } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Signed in as {user?.email}</Text>
      <PaymentHistory />
      <Button title="Logout" onPress={async () => { await logout(); router.replace("/"); }} />
    </View>
  );
}
