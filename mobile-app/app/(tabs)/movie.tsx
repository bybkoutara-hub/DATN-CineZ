import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";

// Mock data for Now Playing movies
const nowPlayingMovies = [
  {
    id: 1,
    title: "Shang-Chi: Legend of the Ten Rings",
    image: require("../../assets/images/shangchi.png"),
    rating: 4.0,
    ratingCount: 983,
    duration: "2 hour 8 minutes",
    genre: "Action, sci-fi",
  },
  {
    id: 2,
    title: "Batman v Superman: Dawn of Justice",
    image: require("../../assets/images/batman.png"),
    rating: 4.6,
    ratingCount: 893,
    duration: "2 hour 10 minutes",
    genre: "Action, crime",
  },
  {
    id: 3,
    title: "Avengers: Infinity War",
    image: require("../../assets/images/AvengersInfinity War.png"),
    rating: 4.7,
    ratingCount: 1112,
    duration: "2 hour 29 minutes",
    genre: "Action, adventure, sci-fi",
  },
  {
    id: 4,
    title: "Guardians of the Galaxy",
    image: require("../../assets/images/guardians.png"),
    rating: 4.5,
    ratingCount: 956,
    duration: "2 hour 1 minute",
    genre: "Action, adventure, comedy",
  },
];

// Mock data for Coming Soon movies
const comingSoonMovies = [
  {
    id: 5,
    title: "Avatar: The Way of Water",
    image: require("../../assets/images/AvengersInfinity War.png"),
    releaseDate: "20.12.2022",
    genre: "Adventure, Sci-fi",
  },
  {
    id: 6,
    title: "Ant-Man and the Wasp: Quantumania",
    image: require("../../assets/images/quantumania.png"),
    releaseDate: "26.12.2022",
    genre: "Adventure, Sci-fi",
  },
  {
    id: 7,
    title: "Shazam!",
    image: require("../../assets/images/shazam.png"),
    releaseDate: "05.01.2023",
    genre: "Action, Comedy",
  },
  {
    id: 8,
    title: "Killers of the Flower Moon",
    image: require("../../assets/images/kotcanotax2.png"),
    releaseDate: "15.01.2023",
    genre: "Crime, Drama",
  },
];

export default function MovieScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("now");
  const nowPlayingList = activeTab === "now" ? nowPlayingMovies : comingSoonMovies;
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movie</Text>
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
              Now playing
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
              Coming soon
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
        <View style={styles.moviesGrid}>
          {nowPlayingList.map((movie, idx) => (
            <TouchableOpacity
              key={movie.id}
              style={styles.posterCard}
              activeOpacity={0.85}
              onPress={() => router.push("/movie-detail")}
            >
              <Image source={movie.image} style={styles.posterImage} resizeMode="cover" />
              <Text style={styles.posterTitle} numberOfLines={2}>{movie.title}</Text>
              <View style={styles.posterMeta}>
                <FontAwesome name="star" size={12} color={PRIMARY_YELLOW} />
                {"rating" in movie ? (
                  <Text style={styles.posterRating}> {movie.rating}</Text>
                ) : null}
                <Text style={styles.posterGenre}> {"releaseDate" in movie ? `• ${movie.releaseDate}` : `• ${movie.genre}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
  },
});
