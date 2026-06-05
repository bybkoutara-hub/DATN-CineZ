import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA
// ==========================================
const PRIMARY_YELLOW = "#E2A43B";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#1A1A1A";
const TEXT_MUTED = "#999999";

export default function MovieDetailScreen() {
  // 1. Khởi tạo router để xử lý quay lại trang trước
  const router = useRouter();

  // State quản lý việc chọn rạp phim (Mặc định chọn rạp đầu tiên như Figma)
  const [selectedCinema, setSelectedCinema] = useState(1);

  // Giả lập dữ liệu phim từ hình ảnh Figma
  const movieData = {
    title: "Avengers: Infinity War",
    duration: "2h29m",
    releaseDate: "16.12.2022",
    rating: "4.8",
    ratingCount: "1.222",
    genre: "Action, adventure, sci-fi",
    censorship: "13+",
    language: "English",
    storyline:
      "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos....",
    directors: [
      {
        id: 1,
        name: "Anthony Russo",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      },
      {
        id: 2,
        name: "Joe Russo",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      },
    ],
    actors: [
      {
        id: 1,
        name: "Robert Downey Jr.",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      },
      {
        id: 2,
        name: "Chris Hemsworth",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", // Link ảnh mới đã hoạt động 100%
      },
      {
        id: 3,
        name: "Chris Evans",
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
      },
    ],
    cinemas: [
      {
        id: 1,
        name: "Vincom Ocean Park CGV",
        distance: "4.55 km",
        address: "Da Ton, Gia Lam, Ha Noi",
        type: "cgv",
      },
      {
        id: 2,
        name: "Aeon Mall CGV",
        distance: "9.32 km",
        address: "27 Co Linh, Long Bien, Ha Noi",
        type: "cgv",
      },
      {
        id: 3,
        name: "Lotte Cinema Long Bien",
        distance: "14.3 km",
        address: "7-9 Nguyen Van Linh, Long Bien, Ha Noi",
        type: "lotte",
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. HERO POSTER BACKGROUND */}
      <ImageBackground
        source={{
          uri: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        }}
        style={styles.heroBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          {/* Nút Back quay lại - ĐÃ ĐƯỢC FIX DÙNG ROUTER.BACK() */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={26} color="#ffffff" />
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.contentScrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. FLOATING MOVIE INFO CARD */}
        <View style={styles.floatingCard}>
          <Text style={styles.movieTitle}>{movieData.title}</Text>
          <Text style={styles.movieSubText}>
            {movieData.duration} • {movieData.releaseDate}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.reviewLabel}>Review</Text>
            <FontAwesome
              name="star"
              size={16}
              color={PRIMARY_YELLOW}
              style={{ marginLeft: 8 }}
            />
            <Text style={styles.ratingScore}> {movieData.rating}</Text>
            <Text style={styles.ratingCount}> ({movieData.ratingCount})</Text>
          </View>

          {/* Interactive Star Selection Row & Watch Trailer Button */}
          <View style={styles.actionRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= 4 ? "star" : "star-o"}
                  size={20}
                  color={star <= 4 ? "#444444" : "#333333"}
                  style={{ marginRight: 6 }}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.watchTrailerBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="play-forward" size={14} color="#ffffff" />
              <Text style={styles.watchTrailerText}>Watch trailer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. METADATA DETAILS (Genre, Censorship, Language) */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Movie genre:</Text>
            <Text style={styles.metaValue}>{movieData.genre}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Censorship:</Text>
            <Text style={styles.metaValue}>{movieData.censorship}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Language:</Text>
            <Text style={styles.metaValue}>{movieData.language}</Text>
          </View>
        </View>

        {/* 4. STORYLINE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Storyline</Text>
          <Text style={styles.storylineText}>
            {movieData.storyline}
            <Text style={styles.seeMoreText}> See more</Text>
          </Text>
        </View>

        {/* 5. DIRECTOR SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Director</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleList}
          >
            {movieData.directors.map((director) => (
              <View key={director.id} style={styles.personCard}>
                <Image
                  source={{ uri: director.avatar }}
                  style={styles.personAvatar}
                />
                <Text style={styles.personName} numberOfLines={2}>
                  {director.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 6. ACTOR SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Actor</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleList}
          >
            {movieData.actors.map((actor) => (
              <View key={actor.id} style={styles.personCard}>
                <Image
                  source={{ uri: actor.avatar }}
                  style={styles.personAvatar}
                />
                <Text style={styles.personName} numberOfLines={2}>
                  {actor.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 7. CINEMA LIST SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cinema</Text>
          {movieData.cinemas.map((cinema) => {
            const isSelected = selectedCinema === cinema.id;
            return (
              <TouchableOpacity
                key={cinema.id}
                activeOpacity={0.85}
                onPress={() => setSelectedCinema(cinema.id)}
                style={[
                  styles.cinemaCard,
                  isSelected
                    ? styles.cinemaCardSelected
                    : styles.cinemaCardNormal,
                ]}
              >
                <View style={styles.cinemaMainInfo}>
                  <Text style={styles.cinemaName}>{cinema.name}</Text>
                  <Text style={styles.cinemaSubDetails}>
                    {cinema.distance} | {cinema.address}
                  </Text>
                </View>

                {/* Giả lập badge logo rạp */}
                <View style={styles.cinemaLogoContainer}>
                  {cinema.type === "cgv" ? (
                    <Text style={styles.cgvLogoText}>CGV</Text>
                  ) : (
                    <Text style={styles.lotteLogoText}>LOTTE</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 8. FIXED BOTTOM CONTINUE BUTTON */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.continueButton}
          onPress={() => router.push("/select-seat")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// STYLESHEET TOÀN DIỆN CHUẨN TỶ LỆ FIGMA
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  headerSafeArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBackground: {
    width: "100%",
    height: 270,
  },
  contentScrollView: {
    flex: 1,
    marginTop: -40, // Kéo phần thân đè lên ảnh nền mờ phía trên giống Figma
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Movie Floating Top Card
  floatingCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  movieTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  movieSubText: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#262626",
    paddingTop: 16,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  watchTrailerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  watchTrailerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Metadata Section
  metaSection: {
    marginBottom: 24,
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  metaLabel: {
    color: TEXT_MUTED,
    width: 110,
    fontSize: 14,
  },
  metaValue: {
    color: "#ffffff",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  // Section Headers & Titles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  storylineText: {
    color: "#BBBBBB",
    fontSize: 14,
    lineHeight: 22,
  },
  seeMoreText: {
    color: PRIMARY_YELLOW,
    fontWeight: "600",
  },

  // Horizontal Profile Row (Directors & Actors)
  peopleList: {
    gap: 12,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 150,
    gap: 10,
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
  },
  personName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },

  // Cinema Cards Layout
  cinemaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  cinemaCardNormal: {
    backgroundColor: "#111111",
    borderColor: "transparent",
  },
  cinemaCardSelected: {
    backgroundColor: "#1C1710", // Màu nền tối pha chút sắc vàng ấm áp
    borderColor: PRIMARY_YELLOW, // Viền vàng Gold nổi bật
  },
  cinemaMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  cinemaName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  cinemaSubDetails: {
    color: "#888888",
    fontSize: 11,
    lineHeight: 16,
  },
  cinemaLogoContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#222",
  },
  cgvLogoText: {
    color: "#E51010", // Đỏ đặc trưng CGV
    fontWeight: "900",
    fontSize: 11,
  },
  lotteLogoText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 9,
  },

  // Fixed Booking Button at bottom
  bottomActionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingBottom: 34, // Đệm cho thanh sọc dưới của dòng iPhone mới
  },
  continueButton: {
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 24,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  continueButtonText: {
    color: BACKGROUND_BLACK,
    fontSize: 16,
    fontWeight: "700",
  },
});
