import { FontAwesome } from "@expo/vector-icons";
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
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getComingSoonMovies,
  getNowPlayingMovies,
} from "../../services/movieService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";

export default function MovieScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("now");

  // Dữ liệu phim lấy từ Backend
  const [nowPlayingMovies, setNowPlayingMovies] = useState<any[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [nowData, comingData] = await Promise.all([
          getNowPlayingMovies(),
          getComingSoonMovies(),
        ]);
        setNowPlayingMovies(nowData || []);
        setComingSoonMovies(comingData || []);
      } catch (error) {
        console.log("Lỗi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const currentList =
    activeTab === "now" ? nowPlayingMovies : comingSoonMovies;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Phim</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "now" && styles.activeTab]}
            onPress={() => setActiveTab("now")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "now" && styles.activeTabText,
              ]}
            >
              Đang chiếu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "coming" && styles.activeTab]}
            onPress={() => setActiveTab("coming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "coming" && styles.activeTabText,
              ]}
            >
              Sắp chiếu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Indicator */}
        <View style={styles.tabIndicatorContainer}>
          <View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  { translateX: activeTab === "now" ? 0 : width / 2 },
                ],
              },
            ]}
          />
        </View>

        {/* Movies Grid */}
        {loading ? (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
            <Text style={{ color: "#888", marginTop: 12 }}>Đang tải phim...</Text>
          </View>
        ) : currentList.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === "now"
              ? "Chưa có phim đang chiếu"
              : "Chưa có phim sắp chiếu"}
          </Text>
        ) : (
          <View style={styles.moviesGrid}>
            {currentList.map((movie, idx) => (
              <TouchableOpacity
                key={movie._id || idx.toString()}
                style={styles.posterCard}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/movie-detail",
                    params: { id: movie._id },
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      movie.poster_url ||
                      "https://via.placeholder.com/300x450",
                  }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                <Text style={styles.posterTitle} numberOfLines={2}>
                  {movie.title}
                </Text>
                <View style={styles.posterMeta}>
                  <FontAwesome name="star" size={12} color={PRIMARY_YELLOW} />
                  <Text style={styles.posterRating}> {movie.rating || "0"}</Text>
                  <Text style={styles.posterGenre} numberOfLines={1}>
                    {" "}
                    • {movie.genres?.join(", ") || "Đang cập nhật"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
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
    paddingBottom: 20,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    // Active state is indicated by the indicator below
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
  },
  activeTabText: {
    color: PRIMARY_YELLOW,
  },

  // Tab Indicator
  tabIndicatorContainer: {
    height: 3,
    backgroundColor: SURFACE_DARK,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  tabIndicator: {
    width: "50%",
    height: "100%",
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 1.5,
  },


  // Now Playing Card
  nowPlayingCard: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: (width - 48) * 0.4,
    height: 150,
    borderRadius: 8,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ratingCount: {
    fontSize: 12,
    color: "#888888",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#888888",
    marginLeft: 6,
  },

  // Coming Soon Card
  comingSoonCard: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  comingSoonImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    borderRadius: 8,
  },
  comingSoonTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoText: {
    fontSize: 11,
    color: "#888888",
    marginLeft: 6,
  },
  moviesGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  posterCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  posterImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.6,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  posterTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  posterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  posterRating: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  posterGenre: {
    color: '#888888',
    fontSize: 11,
    marginLeft: 6,
    flexShrink: 1,
  },
  emptyText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
});
