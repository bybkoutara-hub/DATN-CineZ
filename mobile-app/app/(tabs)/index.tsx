import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
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
// 1. Nhập Hook điều hướng chuẩn của Expo Router
import { useRouter } from "expo-router";

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA TOÀN DIỆN
// ==========================================
const PRIMARY_YELLOW = "#E2A43B";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";

// ==========================================
// CÁC THÀNH PHẦN DÙNG CHUNG (Reusable Components)
// ==========================================

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn}>
      <Text style={styles.seeAllText}>See all</Text>
      <Feather
        name="chevron-right"
        size={14}
        color={PRIMARY_YELLOW}
        style={{ marginLeft: 2 }}
      />
    </TouchableOpacity>
  </View>
);

const ServiceItem = ({
  title,
  iconImage,
}: {
  title: string;
  iconImage: any;
}) => (
  <TouchableOpacity activeOpacity={0.7} style={styles.serviceItem}>
    <View style={styles.serviceIconCircle}>
      <Image source={iconImage} style={styles.serviceCustomImage} />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
);

// ==========================================
// MÀN HÌNH CHÍNH (HomeScreen)
// ==========================================
export default function HomeScreen() {
  // 2. Khởi tạo router điều hướng bên trong Component
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hi, Angelina 👋</Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="#ffffff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* 2. SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={18}
            color="#666666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666666"
            autoCorrect={false}
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.filterIconBtn}>
            <Feather name="sliders" size={18} color={PRIMARY_YELLOW} />
          </TouchableOpacity>
        </View>

        {/* 3. NOW PLAYING SECTION */}
        <SectionHeader title="Now playing" />

        {/* 3. ĐÃ SỬA: Dùng router.push để điều hướng chính xác sang trang movie-detail */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.nowPlayingCard}
          onPress={() => router.push("/movie-detail")}
        >
          <Image
            source={{
              uri: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
            }}
            style={styles.nowPlayingImage}
          />
          <Text style={styles.movieTitle}>Avengers - Infinity War</Text>
          <Text style={styles.movieSubText}>
            2h29m • Action, adventure, sci-fi
          </Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color={PRIMARY_YELLOW} />
            <Text style={styles.ratingScore}> 4.8</Text>
            <Text style={styles.ratingCount}> (1.222)</Text>
          </View>
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>

        {/* 4. COMING SOON SECTION */}
        <SectionHeader title="Coming soon" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
          contentContainerStyle={styles.horizontalListContent}
        >
          {/* Phim 1: Avatar 2 */}
          <View style={styles.comingSoonCard}>
            <Image
              source={require("../../assets/images/avatar.png")}
              style={styles.comingSoonImage}
            />
            <Text style={styles.comingSoonTitle} numberOfLines={2}>
              Avatar 2: The Way Of Water
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="film-outline" size={12} color="#999999" />
              <Text style={styles.infoText}>Adventure, Sci-fi</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={12} color="#999999" />
              <Text style={styles.infoText}>20.12.2022</Text>
            </View>
          </View>

          {/* Phim 2: Ant Man */}
          <View style={styles.comingSoonCard}>
            <Image
              source={require("../../assets/images/AntMan.png")}
              style={styles.comingSoonImage}
            />
            <Text style={styles.comingSoonTitle} numberOfLines={2}>
              Ant Man Wasp: Quantumania
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="film-outline" size={12} color="#999999" />
              <Text style={styles.infoText}>Adventure, Sci-fi</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={12} color="#999999" />
              <Text style={styles.infoText}>26.12.2022</Text>
            </View>
          </View>
        </ScrollView>

        {/* 5. PROMO & DISCOUNT */}
        <SectionHeader title="Promo & Discount" />
        <TouchableOpacity activeOpacity={0.9} style={styles.promoCard}>
          <Image
            source={require("../../assets/images/PromoDiscount.png")}
            style={styles.promoImage}
          />
        </TouchableOpacity>

        {/* 6. SERVICE */}
        <SectionHeader title="Service" />
        <View style={styles.serviceRow}>
          <ServiceItem
            title="Rental"
            iconImage={require("../../assets/images/rental.png")}
          />
          <ServiceItem
            title="Imax"
            iconImage={require("../../assets/images/imax.png")}
          />
          <ServiceItem
            title="4DX"
            iconImage={require("../../assets/images/4dx.png")}
          />
          <ServiceItem
            title="Sweetbox"
            iconImage={require("../../assets/images/sweetbox.png")}
          />
        </View>

        {/* 7. MOVIE NEWS */}
        <SectionHeader title="Movie news" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
          contentContainerStyle={styles.horizontalListContent}
        >
          <View style={styles.newsCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
              }}
              style={styles.newsImage}
            />
            <Text style={styles.newsTitle} numberOfLines={2}>
              When The Batman 2 Starts Filming Reportedly Revealed
            </Text>
          </View>
          <View style={styles.newsCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=500",
              }}
              style={styles.newsImage}
            />
            <Text style={styles.newsTitle} numberOfLines={2}>
              6 Epic Hulk Fights That Happen In The MCU
            </Text>
          </View>
        </ScrollView>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greetingText: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 2,
    fontWeight: "400",
  },
  welcomeText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  notificationBtn: {
    position: "relative",
    padding: 2,
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: "#4CD964",
    borderRadius: 4,
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_DARK,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
  },
  filterIconBtn: {
    paddingLeft: 12,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: PRIMARY_YELLOW,
    fontSize: 13,
    fontWeight: "500",
  },

  // Now Playing
  nowPlayingCard: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  nowPlayingImage: {
    width: "100%",
    height: 410,
    borderRadius: 16,
    marginBottom: 16,
  },
  movieTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  movieSubText: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingScore: {
    color: PRIMARY_YELLOW,
    fontSize: 14,
    fontWeight: "700",
  },
  ratingCount: {
    color: "#666666",
    fontSize: 13,
  },
  paginationDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#333333",
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: PRIMARY_YELLOW,
    width: 18,
  },

  // Horizontal list configs
  horizontalList: {
    marginBottom: 24,
  },
  horizontalListContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  comingSoonCard: {
    width: 145,
  },
  comingSoonImage: {
    width: "100%",
    height: 215,
    borderRadius: 14,
    marginBottom: 10,
  },
  comingSoonTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    color: "#888888",
    fontSize: 12,
  },

  // Promo & Discount
  promoCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 28,
    aspectRatio: 327 / 167,
    width: "88%",
    alignSelf: "center",
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // Service Section
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  serviceItem: {
    alignItems: "center",
    width: 72,
  },
  serviceIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 8,
  },
  serviceCustomImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  serviceTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },

  // Movie News Section
  newsCard: {
    width: 240,
  },
  newsImage: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  newsTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
