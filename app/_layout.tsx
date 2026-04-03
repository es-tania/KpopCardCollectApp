import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import { Colors } from "../src/constants/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}
