import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMovieDetail } from "../services/movieService";
import { getMovieReviews, addReview, deleteReview } from "../services/reviewService";
import { getStoredUser } from "../services/authService";

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

  // State lưu trữ dữ liệu động từ API Backend
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State quản lý việc chọn phòng chiếu từ danh sách lịch chiếu
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  // State quản lý suất chiếu cụ thể được chọn trực tiếp bởi người dùng
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadReviews = async (page = 1) => {
    if (id) {
      const res = await getMovieReviews(id as string, page);
      if (res.success) {
        setReviews(res.data);
        setReviewPage(res.pagination.page);
        setReviewTotalPages(res.pagination.pages);
      }
    }
  };

  // Gọi API Backend lấy thông tin chi tiết phim khi màn hình được load
  useEffect(() => {
    if (id) {
      const loadMovieData = async () => {
        try {
          setLoading(true);
          const data = await getMovieDetail(id as string);
          setMovie(data.movie);
          setShowtimes(data.showtimes);

          // Nếu có danh sách suất chiếu, tự động chọn phòng đầu tiên
          if (data.showtimes && data.showtimes.length > 0) {
            setSelectedRoom(data.showtimes[0].roomName); 
          }
        } catch (error) {
          console.error("Lỗi tải chi tiết phim từ Server:", error);
        } finally {
          setLoading(false);
        }
      };
      loadMovieData();
      loadReviews();
      getStoredUser().then(setCurrentUser);
    }
  }, [id]);

  const handleSubmitReview = async () => {
    try {
      const res = await addReview(id as string, reviewRating, reviewComment);
      if (res.success) {
        Alert.alert("Thành công", "Đánh giá của bạn đã được gửi!");
        setShowReviewForm(false);
        setReviewComment("");
        setReviewRating(5);
        loadReviews();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại!");
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert("Xóa đánh giá", "Bạn có chắc muốn xóa đánh giá này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteReview(reviewId);
            if (res.success) {
              loadReviews(reviewPage);
            }
          } catch {
            Alert.alert("Lỗi", "Không thể xóa đánh giá");
          }
        },
      },
    ]);
  };

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

  // Lọc ra danh sách phòng duy nhất từ mảng suất chiếu
  const uniqueRooms = Array.from(new Set(showtimes.map((s) => s.roomName)));

  // Lấy suất chiếu thuộc phòng đang chọn
  const filteredShowtimes = showtimes.filter((s) => s.roomName === selectedRoom);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. HERO POSTER BACKGROUND (Lấy dữ liệu động từ poster_url backend) */}
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

          {/* Ngôi sao đánh giá tĩnh tương ứng điểm số */}
          <View style={styles.actionRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = movie.rating ? Math.round(movie.rating) : 0;
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
            <Text style={styles.metaLabel}>Thể loại:</Text>
            <Text style={styles.metaValue}>
              {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres || "Đang cập nhật"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Đạo diễn:</Text>
            <Text style={styles.metaValue}>{movie.director || "Đang cập nhật"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Diễn viên:</Text>
            <Text style={styles.metaValue}>
              {Array.isArray(movie.cast) ? movie.cast.join(", ") : movie.cast || "Đang cập nhật"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Kiểm duyệt:</Text>
            <Text style={styles.metaValue}>{movie.rated || "P"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ngôn ngữ:</Text>
            <Text style={styles.metaValue}>{movie.language || "Đang cập nhật"}</Text>
          </View>
        </View>

        {/* 4. STORYLINE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nội dung phim</Text>
          <Text style={styles.storylineText}>
            {movie.storyline || movie.description || "Hệ thống đang cập nhật phần mô tả nội dung câu chuyện cho bộ phim xuất sắc này..."}
          </Text>
        </View>

        {/* 5. ROOM LIST SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phòng chiếu</Text>
          {uniqueRooms.length === 0 ? (
            <Text style={styles.noShowtimeText}>Hiện tại chưa có lịch chiếu cho phim này.</Text>
          ) : (
            uniqueRooms.map((roomName, index) => {
              const isSelected = selectedRoom === roomName;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedRoom(roomName);
                    setSelectedShowtimeId(null);
                  }}
                  style={[
                    styles.cinemaCard,
                    isSelected ? styles.cinemaCardSelected : styles.cinemaCardNormal,
                  ]}
                >
                  <View style={styles.cinemaMainInfo}>
                    <Text style={styles.cinemaName}>{roomName}</Text>
                    <Text style={styles.cinemaSubDetails}>
                      CineZ - Phòng chiếu chất lượng cao
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

        {/* 6. SUẤT CHIẾU THEO PHÒNG ĐÃ CHỌN */}
        {selectedRoom && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Suất chiếu - {selectedRoom}</Text>
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

        {/* 8. BÌNH LUẬN / ĐÁNH GIÁ */}
        <View style={styles.sectionContainer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={styles.sectionTitle}>Bình luận</Text>
            <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
              <Text style={{ color: "#E2A43B", fontSize: 14, fontWeight: "600" }}>
                {showReviewForm ? "Huỷ" : "Viết bình luận"}
              </Text>
            </TouchableOpacity>
          </View>

          {showReviewForm && (
            <View style={{ backgroundColor: "#1A1A1A", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: "#fff", marginBottom: 8, fontSize: 14 }}>Đánh giá của bạn:</Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                    <FontAwesome
                      name={star <= reviewRating ? "star" : "star-o"}
                      size={28}
                      color={star <= reviewRating ? "#E2A43B" : "#333"}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={{ backgroundColor: "#111", color: "#fff", borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: "top" }}
                placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                placeholderTextColor="#666"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
              />
              <TouchableOpacity
                style={{ backgroundColor: "#E2A43B", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 12 }}
                onPress={handleSubmitReview}
              >
                <Text style={{ color: "#000", fontWeight: "700", fontSize: 15 }}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          )}

          {reviews.length === 0 ? (
            <Text style={styles.noShowtimeText}>Chưa có bình luận nào. Hãy là người đầu tiên đánh giá!</Text>
          ) : (
            reviews.map((review) => (
              <View key={review._id} style={{ backgroundColor: "#1A1A1A", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ color: "#E2A43B", fontWeight: "600", fontSize: 14 }}>
                    {review.user?.name || "Người dùng"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name={star <= review.rating ? "star" : "star-o"}
                        size={12}
                        color={star <= review.rating ? "#E2A43B" : "#333"}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                    {currentUser && review.user?._id === currentUser?._id && (
                      <TouchableOpacity onPress={() => handleDeleteReview(review._id)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash-outline" size={14} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={{ color: "#BBB", fontSize: 13, lineHeight: 18 }}>{review.comment}</Text>
                <Text style={{ color: "#555", fontSize: 11, marginTop: 6 }}>
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            ))
          )}
          {reviewTotalPages > 1 && (
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={{ padding: 8, opacity: reviewPage > 1 ? 1 : 0.3 }}
                disabled={reviewPage <= 1}
                onPress={() => loadReviews(reviewPage - 1)}
              >
                <Ionicons name="chevron-back" size={20} color="#E2A43B" />
              </TouchableOpacity>
              <Text style={{ color: "#888", fontSize: 14, alignSelf: "center" }}>
                {reviewPage} / {reviewTotalPages}
              </Text>
              <TouchableOpacity
                style={{ padding: 8, opacity: reviewPage < reviewTotalPages ? 1 : 0.3 }}
                disabled={reviewPage >= reviewTotalPages}
                onPress={() => loadReviews(reviewPage + 1)}
              >
                <Ionicons name="chevron-forward" size={20} color="#E2A43B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 7. FIXED BOTTOM CONTINUE BUTTON */}
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
});