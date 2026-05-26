import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151515";
const SURFACE_LIGHT = "#1F1F1F";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#999999";
const PRIMARY_YELLOW = "#FCC444";
const BORDER_GRAY = "#2A2A2A";

const moviePoster = "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg";

export default function MyTicketScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My ticket</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Image source={{ uri: moviePoster }} style={styles.ticketPoster} />
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketTitle}>Avengers: Infinity War</Text>
              <Text style={styles.ticketMeta}>2 hours 29 minutes</Text>
              <Text style={styles.ticketGenre}>Action, adventure, sci-fi</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color={TEXT_LIGHT} />
              <Text style={styles.detailText}>14h15' • 10.12.2022</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="seat-flat" size={18} color={TEXT_LIGHT} />
              <Text style={styles.detailText}>Section 4 • Seat H7, H8</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color={PRIMARY_YELLOW} />
            <Text style={styles.locationText}>Vincom Ocean Park CGV</Text>
          </View>
          <Text style={styles.locationSubText}>
            4th floor, Vincom Ocean Park, Da Ton, Gia Lam, Ha Noi
          </Text>
          <Text style={styles.qrHint}>Show this QR code to the ticket counter to receive your ticket</Text>

          <View style={styles.barcodeCard}>
            <View style={styles.barcodeLines}>
              {[...Array(14)].map((_, index) => (
                <View key={index} style={styles.barcodeLine} />
              ))}
            </View>
            <Text style={styles.orderId}>Order ID: 78889377726</Text>
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
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    overflow: "hidden",
  },
  ticketHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  ticketPoster: {
    width: 100,
    height: 140,
    borderRadius: 18,
    marginRight: 16,
  },
  ticketInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  ticketTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  ticketMeta: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 6,
  },
  ticketGenre: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  detailsRow: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    color: TEXT_LIGHT,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "600",
  },
  locationSubText: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 16,
  },
  qrHint: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 24,
  },
  barcodeCard: {
    backgroundColor: BACKGROUND_BLACK,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  barcodeLines: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 6,
    marginBottom: 20,
  },
  barcodeLine: {
    width: "6%",
    minHeight: 56,
    backgroundColor: TEXT_LIGHT,
    borderRadius: 4,
  },
  orderId: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
});