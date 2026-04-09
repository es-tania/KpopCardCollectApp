import { Colors } from "@/src/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

// TODO: remplacer par un vrai check auth (Zustand store / SecureStore)
const IS_AUTHENTICATED = false;

export default function RootLayout() {
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
        {/* <Stack.Screen name="(auth)" redirect={IS_AUTHENTICATED} />
        <Stack.Screen name="(tabs)" redirect={!IS_AUTHENTICATED} /> */}
      </Stack>
    </>
  );
}
