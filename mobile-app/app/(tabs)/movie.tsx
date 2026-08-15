import { Feather, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState("now");
  const [nowPlayingMovies, setNowPlayingMovies] = useState<any[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const fetchMovies = async (search?: string, genre?: string) => {
    try {
      if (nowPlayingMovies.length === 0 && comingSoonMovies.length === 0) {
        setLoading(true);
      }
      const [nowData, comingData] = await Promise.all([
        getNowPlayingMovies(search, genre),
        getComingSoonMovies(search, genre),
      ]);
      setNowPlayingMovies(nowData || []);
      setComingSoonMovies(comingData || []);
    } catch (error) {
      console.log("Lỗi tải danh sách phim:", error);
    } finally {
      setLoading(false);
    }
  };

  const { search: searchParam } = useLocalSearchParams<{ search?: string }>();

  useEffect(() => {
    if (!isFocused) return;
    fetchMovies(searchParam ? String(searchParam) : searchQuery || undefined, selectedGenre || undefined);
  }, [isFocused, searchParam]);

  const handleSelectGenre = (genre: string) => {
    const newGenre = genre === selectedGenre ? null : genre;
    setSelectedGenre(newGenre);
    fetchMovies(searchQuery || undefined, newGenre || undefined);
  };

  const currentList = activeTab === "now" ? nowPlayingMovies : comingSoonMovies;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Phim</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="#666666"
            autoCorrect={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchMovies(searchQuery || undefined)}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => { setSearchQuery(""); fetchMovies("", selectedGenre || undefined); }}>
              <Feather name="x" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* GENRE FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreFilterRow} contentContainerStyle={styles.genreFilterContent}>
          <TouchableOpacity
            style={[styles.genreChip, !selectedGenre && styles.genreChipActive]}
            onPress={() => { setSelectedGenre(null); fetchMovies(searchQuery || undefined, undefined); }}
          >
            <Text style={[styles.genreChipText, !selectedGenre && styles.genreChipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {["Hành động", "Tình cảm", "Hài hước", "Kinh dị", "Khoa học viễn tưởng", "Hoạt hình", "Phiêu lưu", "Tâm lý"].map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[styles.genreChip, selectedGenre === genre && styles.genreChipActive]}
              onPress={() => handleSelectGenre(genre)}
            >
              <Text style={[styles.genreChipText, selectedGenre === genre && styles.genreChipTextActive]}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "now" && styles.activeTab]}
            onPress={() => setActiveTab("now")}
          >
            <Text style={[styles.tabText, activeTab === "now" && styles.activeTabText]}>Đang chiếu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "coming" && styles.activeTab]}
            onPress={() => setActiveTab("coming")}
          >
            <Text style={[styles.tabText, activeTab === "coming" && styles.activeTabText]}>Sắp chiếu</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Indicator */}
        <View style={styles.tabIndicatorContainer}>
          <View style={[styles.tabIndicator, { transform: [{ translateX: activeTab === "now" ? 0 : width / 2 }] }]} />
        </View>

        {/* Movies Grid */}
        {loading ? (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
            <Text style={{ color: "#888", marginTop: 12 }}>Đang tải phim...</Text>
          </View>
        ) : currentList.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === "now" ? "Chưa có phim đang chiếu" : "Chưa có phim sắp chiếu"}
          </Text>
        ) : (
          <View style={styles.moviesGrid}>
            {currentList.map((movie, idx) => (
              <TouchableOpacity
                key={movie._id || idx.toString()}
                style={styles.posterCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/movie-detail", params: { id: movie._id } })}
              >
                <Image
                  source={{ uri: movie.poster_url || "https://via.placeholder.com/300x450" }}
                  style={styles.posterImage}
                  contentFit="cover"
                  placeholder={{ uri: "https://via.placeholder.com/300x450?text=Loading" }}
                  cachePolicy="disk"
                />
                <Text style={styles.posterTitle} numberOfLines={2}>{movie.title}</Text>
                <View style={styles.posterMeta}>
                  <FontAwesome name="star" size={12} color={PRIMARY_YELLOW} />
                  <Text style={styles.posterRating}> {movie.rating || "0"}</Text>
                  <Text style={styles.posterGenre} numberOfLines={1}> • {movie.genres?.join(", ") || "Đang cập nhật"}</Text>
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
  container: { flex: 1, backgroundColor: BACKGROUND_BLACK },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: 24, paddingVertical: 16, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: SURFACE_DARK, borderRadius: 10, paddingHorizontal: 16, height: 48, marginHorizontal: 24, marginBottom: 12 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: "#ffffff", fontSize: 15 },
  genreFilterRow: { marginBottom: 12 },
  genreFilterContent: { paddingHorizontal: 24, gap: 8 },
  genreChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: SURFACE_DARK, borderWidth: 1, borderColor: "#333" },
  genreChipActive: { backgroundColor: PRIMARY_YELLOW, borderColor: PRIMARY_YELLOW },
  genreChipText: { color: "#888", fontSize: 13, fontWeight: "500" },
  genreChipTextActive: { color: BACKGROUND_BLACK, fontWeight: "700" },
  tabContainer: { flexDirection: "row", paddingHorizontal: 24, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888888" },
  activeTabText: { color: PRIMARY_YELLOW },
  tabIndicatorContainer: { height: 3, backgroundColor: SURFACE_DARK, marginHorizontal: 24, marginBottom: 20, borderRadius: 1.5, overflow: "hidden" },
  tabIndicator: { width: "50%", height: "100%", backgroundColor: PRIMARY_YELLOW, borderRadius: 1.5 },
  moviesGrid: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  posterCard: { width: CARD_WIDTH, marginBottom: 20 },
  posterImage: { width: CARD_WIDTH, height: CARD_WIDTH * 1.6, borderRadius: 12, backgroundColor: '#2a2a2a' },
  posterTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 8 },
  posterMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  posterRating: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  posterGenre: { color: '#888888', fontSize: 11, marginLeft: 6, flexShrink: 1 },
  emptyText: { color: "#666666", fontSize: 14, textAlign: "center", marginTop: 50, fontStyle: "italic" },
});