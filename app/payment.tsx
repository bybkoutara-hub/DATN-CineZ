import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151515";
const SURFACE_LIGHT = "#1F1F1F";
const PRIMARY_YELLOW = "#FCC444";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#9A9A9A";
const BORDER_GRAY = "#2A2A2A";
const ACTIVE_BORDER = "#FCC444";

const paymentMethods = [
  { id: "zalopay", label: "Zalo Pay", subtitle: "Zalo Pay", color: "#1877F2", icon: "logo-bitcoin" },
  { id: "momo", label: "MoMo", subtitle: "MoMo", color: "#B0369C", icon: "wallet" },
  { id: "shopee", label: "Shopee Pay", subtitle: "Shopee Pay", color: "#F96314", icon: "shopping" },
  { id: "atm", label: "ATM Card", subtitle: "ATM Card", color: "#0A79DF", icon: "card" },
  { id: "international", label: "International payments", subtitle: "Visa, Master, JCB, Amex", color: "#4A4A4A", icon: "globe" },
];

const moviePoster = "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg";

export default function PaymentScreen() {
  const router = useRouter();
  const selectedMethod = "shopee";

  const total = 189000;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <Image source={{ uri: moviePoster }} style={styles.poster} />
          <View style={styles.cardTextSection}>
            <Text style={styles.movieTitle}>Avengers: Infinity War</Text>
            <Text style={styles.movieDetail}>Action, adventure, sci-fi</Text>
            <Text style={styles.movieDetail}>Vincom Ocean Park CGV</Text>
            <Text style={styles.movieDetail}>10.12.2022 • 14:15</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>100 x 141</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>78889377726</Text>
            <Text style={styles.seatText}>H7, H8</Text>
          </View>
        </View>

        <View style={styles.discountRow}>
          <TextInput
            placeholder="discount code"
            placeholderTextColor={TEXT_MUTED}
            style={styles.discountInput}
          />
          <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} VND</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => {
            const active = method.id === selectedMethod;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                style={[styles.methodItem, active && styles.methodItemActive]}
              >
                <View style={[styles.methodIcon, { backgroundColor: method.color }]}> 
                  <MaterialCommunityIcons name={method.icon as any} size={18} color="#fff" />
                </View>
                <View style={styles.methodTextGroup}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.timerCard}>
          <View style={styles.timerLabelContainer}>
            <Text style={styles.timerLabel}>Complete your payment in</Text>
          </View>
          <Text style={styles.timerValue}>15:00</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 22,
  },
  backButton: {
    width: 30,
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: SURFACE_DARK,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: 20,
  },
  poster: {
    width: 100,
    height: 141,
  },
  cardTextSection: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  movieTitle: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  movieDetail: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBox: {
    width: 100,
    height: 141,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "700",
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  orderNumber: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  seatText: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  discountInput: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: SURFACE_LIGHT,
    color: TEXT_LIGHT,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
  },
  applyButton: {
    width: 90,
    height: 50,
    borderRadius: 16,
    backgroundColor: PRIMARY_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    color: BACKGROUND_BLACK,
    fontSize: 14,
    fontWeight: "700",
  },
  totalLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalValue: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  methodsContainer: {
    gap: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
  },
  methodItemActive: {
    borderColor: PRIMARY_YELLOW,
    backgroundColor: "rgba(252,196,68,0.08)",
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  methodTextGroup: {
    flex: 1,
  },
  methodLabel: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  methodSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  timerCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 20,
    backgroundColor: SURFACE_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerLabelContainer: {
    flex: 1,
  },
  timerLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  timerValue: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "700",
  },
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: BORDER_GRAY,
    backgroundColor: BACKGROUND_BLACK,
  },
  continueButton: {
    width: "100%",
    height: 58,
    borderRadius: 30,
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