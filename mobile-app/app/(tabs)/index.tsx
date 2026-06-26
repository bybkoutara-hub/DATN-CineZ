import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import các API services chính xác
import {
  getComingSoonMovies,
  getNowPlayingMovies,
} from "../../services/movieService";

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA TOÀN DIỆN
// ==========================================
const PRIMARY_YELLOW = "#E2A43B";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==========================================
// CÁC THÀNH PHẦN DÙNG CHUNG (Reusable Components)
// ==========================================
const SectionHeader = ({ title, onPress }: { title: string; onPress?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn} onPress={onPress}>
      <Text style={styles.seeAllText}>Xem tất cả</Text>
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
  const router = useRouter();

  // Quản lý State dữ liệu từ API
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [comingSoon, setComingSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quản lý trang hiện tại của Slider Now Playing
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const found = [...nowPlaying, ...comingSoon].find(
      (m) => m.title?.toLowerCase().includes(q)
    );
    if (found) {
      router.push({ pathname: "/movie-detail", params: { id: found._id } });
    }
  };

  // Hàm lấy dữ liệu bất đồng bộ từ Backend
  const fetchMoviesData = async () => {
    try {
      setLoading(true);
      const [nowPlayingData, comingSoonData] = await Promise.all([
        getNowPlayingMovies(),
        getComingSoonMovies(),
      ]);

      console.log("Dữ liệu Now Playing từ API thành công:", nowPlayingData);

      // Cập nhật dữ liệu thật nhận từ server vào State
      setNowPlaying(nowPlayingData || []);
      setComingSoon(comingSoonData || []);
    } catch (error) {
      console.log("Lỗi gọi API hệ thống phim:", error);
    } finally {
      setLoading(false); // Đảm bảo luôn tắt loading sau khi xử lý xong
    }
  };

  // Kích hoạt gọi dữ liệu thật khi màn hình được tải lần đầu
  useEffect(() => {
    fetchMoviesData();
  }, []);

  // Màn hình hiển thị vòng xoay đang tải dữ liệu
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
        <Text style={{ color: "#888", marginTop: 12 }}>Đang tải phim...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Xin chào 👋</Text>
            <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="#ffffff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={18}
            color="#666666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#666666"
            autoCorrect={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.filterIconBtn}>
            <Feather name="sliders" size={18} color={PRIMARY_YELLOW} />
          </TouchableOpacity>
        </View>

        {/* NOW PLAYING SECTION */}
        <SectionHeader title="Đang chiếu" onPress={() => {
          if (nowPlaying.length > 0) {
            router.push({ pathname: "/movie-detail", params: { id: nowPlaying[0]._id } });
          }
        }} />
        {nowPlaying.length === 0 ? (
          <Text style={styles.emptyText}>Không có phim đang chiếu</Text>
        ) : (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH}
              onMomentumScrollEnd={(e) => {
                const contentOffsetX = e.nativeEvent.contentOffset.x;
                const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
                setActivePageIndex(currentIndex);
              }}
            >
              {nowPlaying.map((movie, index) => (
                <View key={movie._id || index.toString()} style={{ width: SCREEN_WIDTH, alignItems: "center" }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.nowPlayingCardInner}
                    onPress={() =>
                      router.push({
                        pathname: "/movie-detail",
                        params: { id: movie._id }, 
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: movie.poster_url || "https://via.placeholder.com/500x750",
                      }}
                      style={styles.nowPlayingImage}
                    />
                    <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                    <Text style={styles.movieSubText}>
                      {movie.duration} phút • {movie.genres?.join(", ") || "Hành động"}
                    </Text>
                    <View style={styles.ratingRow}>
                      <FontAwesome name="star" size={14} color={PRIMARY_YELLOW} />
                      <Text style={styles.ratingScore}> {movie.rating || "4.5"}</Text>
                      <Text style={styles.ratingCount}>
                        {" "}
                        ({movie.total_reviews || "0"})
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.paginationDotsContainer}>
              {nowPlaying.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[styles.dot, activePageIndex === dotIndex && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        )}

        {/* COMING SOON SECTION */}
        <SectionHeader title="Sắp chiếu" onPress={() => {
          if (comingSoon.length > 0) {
            router.push({ pathname: "/movie-detail", params: { id: comingSoon[0]._id } });
          }
        }} />
        {comingSoon.length === 0 ? (
          <Text style={styles.emptyText}>Không có phim sắp chiếu</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
            contentContainerStyle={styles.horizontalListContent}
          >
            {comingSoon.map((movie, index) => (
              <TouchableOpacity
                key={movie._id || index.toString()}
                style={styles.comingSoonCard}
                onPress={() =>
                  router.push({
                    pathname: "/movie-detail",
                    params: { id: movie._id },
                  })
                }
              >
                <Image
                  source={{
                    uri: movie.poster_url || "https://via.placeholder.com/300x450",
                  }}
                  style={styles.comingSoonImage}
                />
                <Text style={styles.comingSoonTitle} numberOfLines={2}>
                  {movie.title}
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="film-outline" size={12} color="#999999" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {movie.genres?.join(", ") || "Khoa học viễn tưởng"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={12} color="#999999" />
                  <Text style={styles.infoText}>
                    {/* Hỗ trợ định dạng lại hiển thị ngày nếu cần thiết */}
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString("vi-VN") : "Sắp chiếu"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* PROMO & DISCOUNT */}
        <SectionHeader title="Khuyến mãi & Giảm giá" />
        <TouchableOpacity activeOpacity={0.9} style={styles.promoCard}>
          <Image
            source={require("../../assets/images/PromoDiscount.png")}
            style={styles.promoImage}
          />
        </TouchableOpacity>

        {/* SERVICE */}
        <SectionHeader title="Dịch vụ" />
        <View style={styles.serviceRow}>
          <ServiceItem
            title="Thuê phim"
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

        {/* MOVIE NEWS */}
        <SectionHeader title="Tin tức phim" />
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
              Lộ thời điểm The Batman 2 bắt đầu bấm máy
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
              6 trận chiến hoành tráng nhất của Hulk trong MCU
            </Text>
          </View>
        </ScrollView>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// TỐI ƯU HÓA STYLESHEET TOÀN DIỆN
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  scrollContent: {
    paddingTop: 16,
  },
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
  nowPlayingCardInner: {
    width: SCREEN_WIDTH - 48,
    alignItems: "center",
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
    marginBottom: 10,
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
  paginationDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 24,
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
  promoCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 28,
    aspectRatio: 327 / 167,
    width: SCREEN_WIDTH - 48,
    alignSelf: "center",
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
  emptyText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
});