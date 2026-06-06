import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151515";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#9A9A9A";
const PRIMARY_YELLOW = "#FCC444";

export default function ProfileScreen() {
  const router = useRouter();
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* HEADER FIGMA GỐC */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile User</Text>

        <TouchableOpacity
          style={[styles.headerButton, styles.alignRight]}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={20} color={TEXT_LIGHT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* KHỐI USER THÔNG TIN NGANG THEO FIGMA */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Angelina</Text>

            <View style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={TEXT_MUTED}
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>(704) 555-0127</Text>
            </View>

            <View style={styles.contactRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color={TEXT_MUTED}
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>angelina@example.com</Text>
            </View>
          </View>
        </View>

        {/* DANH SÁCH MENU MENU ITEMS */}
        <View style={styles.menuCard}>
          {/* Mục 1: My Ticket */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => router.push("/my-ticket")}
          >
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My ticket</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 2: Payment History */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="history"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Payment history</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 3: Change Language */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Change language</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 4: Change Password */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Change password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 5: Toggle FaceID */}
          <View style={[styles.menuItem, styles.noBorderBottom]}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Face ID / Touch ID</Text>
            </View>
            <Switch
              trackColor={{ false: "#2C2C2E", true: "rgba(252,196,68,0.3)" }}
              thumbColor={isFaceIdEnabled ? PRIMARY_YELLOW : "#E5E5EA"}
              ios_backgroundColor="#2C2C2E"
              onValueChange={setIsFaceIdEnabled}
              value={isFaceIdEnabled}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
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
    height: 56,
  },
  headerButton: {
    width: 40,
    justifyContent: "center",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  /* THÔNG TIN USER (FLAT ROW) */
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  contactIcon: {
    marginRight: 6,
  },
  contactText: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "400",
  },
  /* KHỐI MENU HỘP XÁM BO GÓC */
  menuCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  noBorderBottom: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "600",
  },
});
