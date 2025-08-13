import React from "react";
import { View, Text } from "react-native";

export default function TenantDashboard() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18 }}>Tenant Dashboard</Text>
      <Text>Your upcoming rent, maintenance announcements etc will appear here.</Text>
    </View>
  );
}
