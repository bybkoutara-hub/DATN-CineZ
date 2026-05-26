import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151515";
const SURFACE_LIGHT = "#1F1F1F";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#9A9A9A";
const PRIMARY_YELLOW = "#FCC444";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile User</Text>
        <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
          <Ionicons name="pencil" size={20} color={TEXT_LIGHT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Angelina</Text>
          <Text style={styles.phone}>(704) 555-0127</Text>
          <Text style={styles.email}>angelina@example.com</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => router.push("/my-ticket")}
          >
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="ticket-confirmation" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>My ticket</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="history" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Payment history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="translate" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Change language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Change password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="face-recognition" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Face ID / Touch ID</Text>
            </View>
            <View style={styles.toggleCircle}>
              <View style={styles.toggleDot} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  backButton: {
    width: 30,
  },
  editButton: {
    width: 30,
    alignItems: "flex-end",
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  name: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  phone: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 4,
  },
  email: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  menuCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 24,
    paddingVertical: 14,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleCircle: {
    width: 40,
    height: 24,
    borderRadius: 16,
    backgroundColor: "rgba(252,196,68,0.18)",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY_YELLOW,
    alignSelf: "flex-end",
  },
});