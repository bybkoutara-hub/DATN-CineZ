import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: PRIMARY_YELLOW,
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-variant"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ticket"
        options={{
          title: "Ticket",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="movie"
        options={{
          title: "Movie",
          tabBarIcon: ({ color }) => (
            <Feather name="video" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BACKGROUND_BLACK,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    height: Platform.OS === "ios" ? 85 : 65,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
