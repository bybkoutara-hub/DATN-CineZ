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

// ==========================================
// CÁC THÀNH PHẦN DÙNG CHUNG (Reusable Components)
// ==========================================

// 1. Tiêu đề các mục (Đã sửa nút See all kèm dấu > chuẩn Figma)
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn}>
      <Text style={styles.seeAllText}>See all </Text>
      <Feather
        name="chevron-right"
        size={14}
        color={PRIMARY_YELLOW}
        style={{ marginTop: 2 }}
      />
    </TouchableOpacity>
  </View>
);

// 2. Các mục Dịch vụ
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
        <View style={styles.nowPlayingCard}>
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
        </View>

        {/* 4. COMING SOON SECTION (Đã đồng bộ màu text màu cam/vàng chuẩn Figma) */}
        <SectionHeader title="Coming soon" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
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

        {/* 5. PROMO & DISCOUNT (Sửa triệt để lỗi mất ảnh hiển thị) */}
        <SectionHeader title="Promo & Discount" />
        <TouchableOpacity activeOpacity={0.9} style={styles.promoCard}>
          <Image
            source={require("../../assets/images/Promo&Discount.png")}
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
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// HỆ MÀU SẮC & PHONG CÁCH GIAO DIỆN (Styles)
// ==========================================
const PRIMARY_YELLOW = "#D2A13A"; // Màu vàng đồng chuẩn thiết kế sang trọng
const TEXT_GOLD = "#D5A53B"; // Màu vàng cam riêng cho tiêu đề phim sắp chiếu
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517"; // Màu xám đen chuẩn nút/khung nền

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
    color: "#999999",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "400",
  },
  welcomeText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  notificationBtn: {
    position: "relative",
    padding: 4,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
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
    borderRadius: 12,
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
    marginTop: 12,
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
    height: 400,
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
    color: "#999999",
    fontSize: 13,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingScore: {
    color: "#ffffff",
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

  // Coming Soon (Đã đổi màu chữ sang màu vàng đồng của Figma)
  horizontalList: {
    marginHorizontal: -24,
    marginBottom: 24,
  },
  comingSoonCard: {
    width: 150,
  },
  comingSoonImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  comingSoonTitle: {
    color: TEXT_GOLD,
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
    color: "#999999",
    fontSize: 11,
  },

  // Promo Section (SỬA FIX LỖI ẢNH ĐEN: Đưa width/height chuẩn xác)
  promoCard: {
    marginHorizontal: 24,
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 28,
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
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
    width: 70,
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceCustomImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  serviceTitle: {
    color: "#999999",
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
