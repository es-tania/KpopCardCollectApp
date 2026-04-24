import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/useAuth";
import { useCollectionStore } from "@/src/store/collectionStore";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { initExecutorch } from "react-native-executorch";
import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";

initExecutorch({ resourceFetcher: ExpoResourceFetcher });

export default function RootLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const initStore = useCollectionStore((s) => s.init);

  useEffect(() => {
    if (user) initStore(user.id);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          freezeOnBlur: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}
