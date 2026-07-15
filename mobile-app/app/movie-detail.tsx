import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, // Đã thêm thư viện TextInput để nhập bình luận
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Nhập các hàm gọi API
import { getMovieDetail } from "../services/movieService"; 
import { fetchMovieComments, sendComment } from "../services/commentService"; // API bình luận

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA
// ==========================================
const PRIMARY_YELLOW = "#E2A43B";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#1A1A1A";
const TEXT_MUTED = "#999999";

export default function MovieDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Nhận Movie ID truyền từ HomeScreen sang

  // Các State quản lý Bình luận
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  // State giả lập kiểm tra đăng nhập (Sau này bạn sẽ nối với luồng Login thực tế để lấy Token)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
  // Thêm hàm kiểm tra đăng nhập này
  const checkLoginStatus = async () => {
    try {
      // Đổi 'userToken' thành đúng cái tên key mà hàm loginApi của bạn đã lưu
      const token = await AsyncStorage.getItem('userToken'); 
      if (token) {
        setIsLoggedIn(true);
        setUserToken(token);
      }
    } catch (error) {
      console.log("Chưa đăng nhập");
    }
  };

  if (id) {
    const loadMovieData = async () => {
      // ... (code fetch phim và comment giữ nguyên)
    };
    
    checkLoginStatus(); // Gọi hàm check token
    loadMovieData();
  }
}, [id]);
  

  // State lưu trữ dữ liệu động từ API Backend
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State quản lý việc chọn rạp phim từ danh sách lịch chiếu động
  const [selectedCinema, setSelectedCinema] = useState<string | null>(null);
  
  // State quản lý suất chiếu cụ thể được chọn trực tiếp bởi người dùng
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);

  // Gọi API Backend lấy thông tin chi tiết phim & Bình luận khi màn hình được load
  useEffect(() => {
    if (id) {
      const loadMovieData = async () => {
        try {
          setLoading(true);
          const data = await getMovieDetail(id as string);
          setMovie(data.movie);
          setShowtimes(data.showtimes);

          // Nếu có danh sách suất chiếu, tự động chọn rạp đầu tiên xuất hiện trong lịch chiếu
          if (data.showtimes && data.showtimes.length > 0) {
            setSelectedCinema(data.showtimes[0].roomName); 
          }

          // Gọi thêm API kéo danh sách bình luận về
          const commentData = await fetchMovieComments(id as string);
          if (commentData && commentData.success) {
            setComments(commentData.comments);
          }
        } catch (error) {
          console.error("Lỗi tải dữ liệu từ Server:", error);
        } finally {
          setLoading(false);
        }
      };
      loadMovieData();
    }
  }, [id]);

  // Loading Indicator hiển thị trong lúc chờ phản hồi từ API
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
        <Text style={{ color: "#fff", marginTop: 12 }}>Đang tải thông tin phim...</Text>
      </View>
    );
  }

  // Trường hợp xảy ra lỗi hoặc không tìm thấy phim
  if (!movie) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#fff", marginBottom: 16 }}>Không tìm thấy dữ liệu phim này.</Text>
        <TouchableOpacity style={styles.watchTrailerBtn} onPress={() => router.back()}>
          <Text style={{ color: "#fff" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Lọc ra danh sách các rạp duy nhất (Unique Cinemas/Rooms) từ mảng suất chiếu trả về
  const uniqueCinemas = Array.from(new Set(showtimes.map((s) => s.roomName)));

  // Lấy ra danh sách suất chiếu thuộc về rạp hiện tại đang được nhấn chọn
  const filteredShowtimes = showtimes.filter((s) => s.roomName === selectedCinema);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. HERO POSTER BACKGROUND */}
      <ImageBackground
        source={{
          uri: movie.poster_url || "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        }}
        style={styles.heroBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
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
          <Text style={styles.movieTitle}>{movie.title}</Text>
          <Text style={styles.movieSubText}>
            {movie.duration} phút • Khởi chiếu: {movie.release_date || "Đang cập nhật"}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.reviewLabel}>Đánh giá</Text>
            <FontAwesome
              name="star"
              size={16}
              color={PRIMARY_YELLOW}
              style={{ marginLeft: 8 }}
            />
            <Text style={styles.ratingScore}> {movie.rating || "0.0"}</Text>
            <Text style={styles.ratingCount}> ({movie.total_reviews || "0"} lượt đánh giá)</Text>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = movie.rating ? Math.round(movie.rating / 2) : 4;
                return (
                  <FontAwesome
                    key={star}
                    name={star <= currentRating ? "star" : "star-o"}
                    size={20}
                    color={star <= currentRating ? PRIMARY_YELLOW : "#333333"}
                    style={{ marginRight: 6 }}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.watchTrailerBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="play-forward" size={14} color="#ffffff" />
              <Text style={styles.watchTrailerText}>Xem trailer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. METADATA DETAILS */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Đạo diễn:</Text>
            <Text style={styles.metaValue}>{movie.director || "Đang cập nhật"}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Diễn viên:</Text>
            <Text style={styles.metaValue}>{movie.cast || "Đang cập nhật"}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Thể loại:</Text>
            <Text style={styles.metaValue}>
              {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || "Action, Drama"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Kiểm duyệt:</Text>
            <Text style={styles.metaValue}>{movie.status === "now_playing" ? "13+" : "P"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ngôn ngữ:</Text>
            <Text style={styles.metaValue}>Tiếng Anh / Phụ đề Việt</Text>
          </View>
        </View>
        
        {/* 4. STORYLINE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nội dung phim</Text>
          <Text style={styles.storylineText}>
            {movie.storyline || "Hệ thống đang cập nhật phần mô tả nội dung câu chuyện cho bộ phim xuất sắc này..."}
            <Text style={styles.seeMoreText}> Xem thêm</Text>
          </Text>
        </View>

       {/* 5. NÚT ĐIỀU HƯỚNG BÌNH LUẬN (Giao diện sạch sẽ) */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.commentSummaryBtn}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: "/movie-comments",
              params: { movieId: id, movieTitle: movie.title }
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name="chatbubbles" size={28} color={PRIMARY_YELLOW} />
              <View>
                <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>Bình luận & Đánh giá</Text>
                <Text style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 2 }}>
                  {comments.length > 0 ? `Xem tất cả ${comments.length} bình luận` : "Chưa có đánh giá nào."}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* 6. CINEMA LIST SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Rạp chiếu</Text>
          {uniqueCinemas.length === 0 ? (
            <Text style={styles.noShowtimeText}>Hiện tại chưa có lịch rạp khả dụng cho phim này.</Text>
          ) : (
            uniqueCinemas.map((cinemaName, index) => {
              const isSelected = selectedCinema === cinemaName;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedCinema(cinemaName);
                    setSelectedShowtimeId(null); 
                  }}
                  style={[
                    styles.cinemaCard,
                    isSelected ? styles.cinemaCardSelected : styles.cinemaCardNormal,
                  ]}
                >
                  <View style={styles.cinemaMainInfo}>
                    <Text style={styles.cinemaName}>{cinemaName}</Text>
                    <Text style={styles.cinemaSubDetails}>
                      Hệ thống rạp chiếu CineZ Premium kĩ thuật số chất lượng cao
                    </Text>
                  </View>

                  <View style={styles.cinemaLogoContainer}>
                    <Text style={styles.cgvLogoText}>CineZ</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 7. SUẤT CHIẾU TƯƠNG ỨNG RẠP ĐƯỢC CHỌN */}
        {selectedCinema && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Suất chiếu tại {selectedCinema}</Text>
            {filteredShowtimes.length === 0 ? (
              <Text style={styles.noShowtimeText}>Không có suất chiếu nào hôm nay.</Text>
            ) : (
              <View style={styles.showtimeGrid}>
                {filteredShowtimes.map((item) => {
                  const timeDisplay = new Date(item.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isTimeSelected = selectedShowtimeId === item._id;

                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[
                        styles.timeButton,
                        isTimeSelected && styles.timeButtonSelected
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedShowtimeId(item._id)}
                    >
                      <Text style={[styles.timeText, isTimeSelected && styles.timeTextSelected]}>
                        {timeDisplay}
                      </Text>
                      <Text style={[styles.priceText, isTimeSelected && styles.priceTextSelected]}>
                        {item.price ? `${item.price.toLocaleString()}đ` : "Giá vé gốc"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 8. FIXED BOTTOM CONTINUE BUTTON */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.continueButton,
            !selectedShowtimeId && { backgroundColor: "#333333" }
          ]}
          disabled={!selectedShowtimeId}
          onPress={() => {
            if (selectedShowtimeId) {
              router.push({
                pathname: "/select-seat",
                params: {
                  showtimeId: selectedShowtimeId,
                  movieTitle: movie.title,
                  moviePoster: movie.poster_url,
                },
              });
            }
          }}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedShowtimeId && { color: "#666666" }
          ]}>
            Tiếp tục
          </Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  heroBackground: {
    width: "100%",
    height: 270,
  },
  contentScrollView: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
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
    backgroundColor: "#1C1710",
    borderColor: PRIMARY_YELLOW,
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
    color: PRIMARY_YELLOW,
    fontWeight: "900",
    fontSize: 11,
  },
  noShowtimeText: {
    color: "#666666",
    fontStyle: "italic",
    fontSize: 14,
  },
  showtimeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  timeButton: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: "29%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  timeButtonSelected: {
    backgroundColor: PRIMARY_YELLOW,
    borderColor: PRIMARY_YELLOW,
  },
  timeText: {
    color: PRIMARY_YELLOW,
    fontSize: 16,
    fontWeight: "700",
  },
  timeTextSelected: {
    color: BACKGROUND_BLACK,
  },
  priceText: {
    color: "#666",
    fontSize: 10,
    marginTop: 2,
  },
  priceTextSelected: {
    color: BACKGROUND_BLACK,
    fontWeight: "500",
  },
  bottomActionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingBottom: 34,
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
  commentSummaryBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111111",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#262626",
  },
});