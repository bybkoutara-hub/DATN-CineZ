import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA
// ==========================================
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";
const SURFACE_LIGHT = "#1F1F21";
const PRIMARY_YELLOW = "#E2A43B";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#888888";
const BORDER_GRAY = "#242426";

export default function PaymentScreen() {
  const router = useRouter();

  // State quản lý phương thức được chọn (Mặc định chọn Shopee Pay)
  const [selectedMethod, setSelectedMethod] = useState("shopee");

  // Dữ liệu danh sách phương thức thanh toán (Đã sửa require đường dẫn ảnh cục bộ)
  const paymentMethods = [
    {
      id: "zalopay",
      label: "Zalo Pay",
      image: require("../assets/images/zalopay.png"),
    },
    {
      id: "momo",
      label: "MoMo",
      image: require("../assets/images/momo.png"),
    },
    {
      id: "shopee",
      label: "Shopee Pay",
      image: require("../assets/images/shoppepay.png"),
    },
    {
      id: "atm",
      label: "ATM Card",
      image: require("../assets/images/ATM.png"),
    },
    {
      id: "international",
      label: "International payments",
      subtitle: "(Visa, Master, JCB, Amex)",
      image: require("../assets/images/visa.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* ==========================================
          1. HEADER BAR
          ========================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ==========================================
            2. THÈ THÔNG TIN PHIM
            ========================================== */}
        <View style={styles.cardContainer}>
          <Image
            source={{
              uri: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
            }}
            style={styles.poster}
          />
          <View style={styles.cardTextSection}>
            <Text style={styles.movieTitle}>Avengers: Infinity War</Text>

            <View style={styles.movieDetailRow}>
              <Ionicons name="film-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>
                Action, adventure, sci-fi
              </Text>
            </View>

            <View style={styles.movieDetailRow}>
              <Ionicons name="location-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>Vincom Ocean Park CGV</Text>
            </View>

            <View style={styles.movieDetailRow}>
              <Ionicons name="time-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>10.12.2022 • 14:15</Text>
            </View>
          </View>
        </View>

        {/* ==========================================
            3. CHI TIẾT ĐƠN HÀNG (ORDER DETAILS)
            ========================================== */}
        <View style={styles.orderDetailSection}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValueBold}>78889377726</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Seat</Text>
            <Text style={styles.orderValueBold}>H7, H8</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            4. KHỐI NHẬP MÃ GIẢM GIÁ (DISCOUNT)
            ========================================== */}
        <View style={styles.discountRow}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="ticket-outline"
              size={18}
              color={TEXT_MUTED}
              style={styles.ticketIcon}
            />
            <TextInput
              placeholder="discount code"
              placeholderTextColor={TEXT_MUTED}
              style={styles.discountInput}
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            5. TỔNG TIỀN (TOTAL)
            ========================================== */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>189.000 VND</Text>
        </View>

        {/* ==========================================
            6. PHƯƠNG THỨC THANH TOÁN (PAYMENT METHODS)
            ========================================== */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => {
            const isActive = method.id === selectedMethod;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod(method.id)}
                style={[styles.methodItem, isActive && styles.methodItemActive]}
              >
                {/* Khối bọc logo nền trắng chuẩn Figma */}
                <View style={styles.logoContainer}>
                  <Image
                    source={method.image}
                    style={styles.methodLogo}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.methodTextGroup}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  {method.subtitle && (
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isActive ? PRIMARY_YELLOW : TEXT_MUTED}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ==========================================
            7. ĐỒNG HỒ ĐẾM NGƯỢC (TIMER CARD)
            ========================================== */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Complete your payment in</Text>
          <Text style={styles.timerValue}>15:00</Text>
        </View>
      </ScrollView>

      {/* ==========================================
          8. NÚT TIẾP TỤC CỐ ĐỊNH Ở ĐÁY (BOTTOM BUTTON)
          ========================================== */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// KIỂU DÁNG STYLESHEET TOÀN DIỆN
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 30,
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 140, // Đệm dưới tránh nút Bottom Action đè chữ
  },

  // Movie Card Section
  cardContainer: {
    flexDirection: "row",
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  poster: {
    width: 95,
    height: 135,
    borderRadius: 12,
  },
  cardTextSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  movieTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  movieDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  movieDetailText: {
    color: TEXT_MUTED,
    fontSize: 13,
  },

  // Order Details Section
  orderDetailSection: {
    gap: 12,
    marginBottom: 16,
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  orderValueBold: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_GRAY,
    marginVertical: 16,
  },

  // Discount Section
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: SURFACE_DARK,
    paddingHorizontal: 14,
    marginRight: 12,
  },
  ticketIcon: {
    marginRight: 8,
  },
  discountInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 14,
  },
  applyButton: {
    width: 85,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    color: BACKGROUND_BLACK,
    fontSize: 14,
    fontWeight: "700",
  },

  // Total Section
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  totalLabel: {
    color: TEXT_MUTED,
    fontSize: 15,
  },
  totalValue: {
    color: PRIMARY_YELLOW,
    fontSize: 20,
    fontWeight: "800",
  },

  // Payment Methods Section
  sectionTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
  },
  methodsContainer: {
    gap: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: SURFACE_DARK,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodItemActive: {
    borderColor: PRIMARY_YELLOW,
    backgroundColor: "rgba(226, 164, 59, 0.05)",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
    padding: 4,
  },
  methodLogo: {
    width: "100%",
    height: "100%",
  },
  methodTextGroup: {
    flex: 1,
  },
  methodLabel: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "600",
  },
  methodSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  // Timer Section
  timerCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: SURFACE_DARK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  timerValue: {
    color: PRIMARY_YELLOW,
    fontSize: 15,
    fontWeight: "700",
  },

  // Bottom Fixed Button Action
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: BACKGROUND_BLACK,
  },
  continueButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: BACKGROUND_BLACK,
    fontSize: 16,
    fontWeight: "700",
  },
});
