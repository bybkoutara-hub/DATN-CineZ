import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
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
import {
  getProfileApi,
  getStoredUser,
  logoutApi,
} from "../../services/authService";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151515";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#9A9A9A";
const PRIMARY_YELLOW = "#FCC444";

export default function ProfileScreen() {
  const router = useRouter();
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Lấy thông tin user: hiển thị nhanh từ bộ nhớ máy, rồi cập nhật từ server
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadUser = async () => {
        const cached = await getStoredUser();
        if (active && cached) setUser(cached);
        try {
          const fresh = await getProfileApi();
          if (active && fresh) setUser(fresh);
        } catch {
          // Chưa đăng nhập hoặc token hết hạn -> giữ dữ liệu cache (nếu có)
        }
      };
      loadUser();
      return () => {
        active = false;
      };
    }, []),
  );

  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
    router.replace("/sign-in");
  };

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

        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>

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
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {(user?.name || "K")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Khách"}</Text>

            <View style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={TEXT_MUTED}
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>
                {user?.phone || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color={TEXT_MUTED}
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>
                {user?.email || "Chưa đăng nhập"}
              </Text>
            </View>
          </View>
        </View>

        {/* DANH SÁCH MENU MENU ITEMS */}
        <View style={styles.menuCard}>
          {/* Mục 1: My Ticket */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/ticket")}
          >
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Vé của tôi</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 2: Payment History */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push("/(tabs)/ticket")}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons
                name="history"
                size={20}
                color={TEXT_LIGHT}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Lịch sử thanh toán</Text>
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
              <Text style={styles.menuTitle}>Đổi ngôn ngữ</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {/* Mục 4: Change Password */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={() => router.push({ pathname: "/change-password" as any })}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed" size={20} color={TEXT_LIGHT} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
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

        {/* NÚT ĐĂNG XUẤT */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF453A" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
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
  avatarFallback: {
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FCC444",
    fontSize: 32,
    fontWeight: "700",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,69,58,0.4)",
    backgroundColor: "rgba(255,69,58,0.08)",
  },
  logoutText: {
    color: "#FF453A",
    fontSize: 15,
    fontWeight: "700",
  },
});
