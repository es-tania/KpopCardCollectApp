import { Tabs } from "expo-router";
import { Home, ScanLine, Search, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../src/constants/colors";
import { Theme } from "../../src/constants/theme";

interface TabIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, label, focused }) => (
  <View style={styles.tabItem}>
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      {icon}
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        // animation: "fade",
        animation: "none",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Accueil"
              focused={focused}
              icon={
                <Home
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.6}
                  color={focused ? Colors.accent : Colors.textMuted}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Recherche"
              focused={focused}
              icon={
                <Search
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.6}
                  color={focused ? Colors.accent : Colors.textMuted}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: focused ? Colors.accent : Colors.surface2,
                borderWidth: 2,
                borderColor: focused ? Colors.accent : Colors.border,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                shadowColor: Colors.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: focused ? 0.4 : 0,
                shadowRadius: 8,
                elevation: focused ? 8 : 0,
              }}
            >
              <ScanLine
                size={22}
                color={focused ? Colors.bg : Colors.textMuted}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Profil"
              focused={focused}
              icon={
                <User
                  size={20}
                  strokeWidth={focused ? 2.2 : 1.6}
                  color={focused ? Colors.accent : Colors.textMuted}
                />
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 0.5,
    height: 100,
    // paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: "center",
    gap: 3,
    width: 60,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.full,
  },
  iconWrapperActive: {
    backgroundColor: Colors.pillActive,
  },
  tabLabel: {
    fontSize: Theme.fontSize.xs + 1,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.regular,
  },
  tabLabelActive: {
    color: Colors.accent,
    fontWeight: Theme.fontWeight.medium,
  },
});
