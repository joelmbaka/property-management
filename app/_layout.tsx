import { Stack, useRouter, useSegments } from "expo-router";
import React from "react";
import { AuthProvider, useAuth } from "../lib/AuthProvider"

function AuthGate({ children }: { children: React.ReactNode }) {
  const { initializing, user, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const firstSegment = (segments[0] ?? "") as string;
  const isLogin = firstSegment === "login";
  const isAdminSection = firstSegment === "admin";
  const isTenantSection = firstSegment === "tenant";

  React.useEffect(() => {
    if (initializing) return;
    // Unauthenticated access guard
    if ((isAdminSection || isTenantSection) && !user) {
      router.replace({ pathname: "/" } as any);
      return;
    }

    // Authenticated and on login page → home (will redirect further below)
    if (user && isLogin) {
      router.replace({ pathname: "/" } as any);
      return;
    }

    if (isAdmin) {
      // Keep admins under /admin
      if (!isAdminSection) router.replace({ pathname: "/admin" } as any);
    }
    // For regular users remain on current path; no automatic redirect to /tenant
  }, [initializing, user, isLogin, isAdminSection, isTenantSection, isAdmin]);
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerTitle: () => null, headerBackTitle: "" }}>
          <Stack.Screen name="index" options={{ headerTitle: "Mombasa Homes" }} />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}
