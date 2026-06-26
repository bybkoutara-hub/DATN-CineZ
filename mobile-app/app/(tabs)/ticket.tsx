import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyBookings } from "../../services/bookingService";

// Định dạng giờ và ngày từ chuỗi ISO mà backend trả về
const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "--";

// Nhãn tiếng Việt cho trạng thái vé
const statusLabel = (status?: string) => {
  switch (status) {
    case "completed":
      return "Đã thanh toán";
    case "pending":
      return "Chờ thanh toán";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Đã đặt";
  }
};

// Màu sắc tương ứng từng trạng thái
const statusStyle = (status?: string) => {
  switch (status) {
    case "completed":
      return { box: { backgroundColor: "rgba(52,199,89,0.15)" }, text: { color: "#34C759" } };
    case "pending":
      return { box: { backgroundColor: "rgba(252,196,52,0.15)" }, text: { color: "#FCC444" } };
    case "cancelled":
      return { box: { backgroundColor: "rgba(255,69,58,0.15)" }, text: { color: "#FF453A" } };
    default:
      return { box: { backgroundColor: "rgba(255,255,255,0.08)" }, text: { color: "#D1D1D6" } };
  }
};

export default function TicketListScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải lại lịch sử vé mỗi khi tab được mở (để cập nhật vé mới nhất)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        setLoading(true);
        const data = await getMyBookings();
        if (active) {
          setBookings(data || []);
          setLoading(false);
        }
      };
      load();
      return () => {
        active = false;
      };
    }, []),
  );

  const renderTicketItem = ({ item }: { item: any }) => {
    const movie = item?.showtime?.movieId || {};
    const showtime = item?.showtime || {};
    return (
      <TouchableOpacity
        style={styles.ticketCard}
        activeOpacity={0.85}
        onPress={() => {
          // Truyền dữ liệu vé sang màn chi tiết để hiển thị
          router.push({
            pathname: "/my-ticket",
            params: {
              bookingId: item._id || "",
              title: movie.title || "Phim",
              poster: movie.poster_url || "",
              duration: String(movie.duration || ""),
              room: showtime.roomName || "",
              time: formatTime(showtime.startTime),
              date: formatDate(showtime.startTime),
              seats: (item.seats || []).join(", "),
              totalPrice: String(item.totalPrice || ""),
              status: item.status || "",
              combos: JSON.stringify(item.combos || []),
            },
          });
        }}
      >
        {/* Poster Phim */}
        <Image
          source={{
            uri: movie.poster_url || "https://via.placeholder.com/95x120",
          }}
          style={styles.posterImage}
          resizeMode="cover"
        />

        {/* Nội dung thông tin vé bên phải */}
        <View style={styles.ticketDetails}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {movie.title || "Phim"}
          </Text>

          {/* Hàng chứa Thời gian & Ngày tháng */}
          <View style={styles.metaRow}>
            <Feather name="clock" size={15} color="#A3A3A3" />
            <Text style={styles.metaText}>
              {formatTime(showtime.startTime)} • {formatDate(showtime.startTime)}
            </Text>
          </View>

          {/* Hàng chứa Phòng chiếu & Ghế */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#A3A3A3" />
            <Text style={styles.metaText} numberOfLines={1}>
              {showtime.roomName || "Phòng chiếu"} • Ghế{" "}
              {(item.seats || []).join(", ")}
            </Text>
          </View>

          {/* Nhãn trạng thái vé */}
          <View style={[styles.statusBadge, statusStyle(item.status).box]}>
            <Text style={[styles.statusText, statusStyle(item.status).text]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vé của tôi</Text>
      </View>

      {loading ? (
        <View style={{ paddingTop: 60, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FCC444" />
          <Text style={{ color: "#888", marginTop: 12 }}>Đang tải vé...</Text>
        </View>
      ) : (
        /* DANH SÁCH VÉ VỚI FLATLIST */
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Bạn chưa có vé nào. Hãy đặt vé xem phim ngay nhé!
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Màu nền đen tuyền đồng bộ toàn hệ thống ứng dụng CineZ
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16, // Tạo khoảng cách đều 16px giữa các item theo layout Figma
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E", // Màu xám nốt tối (Dark Card Background) chuẩn tỉ lệ tương phản
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
  },
  posterImage: {
    width: 95,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  ticketDetails: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    gap: 10, // Giữ khoảng cách thoáng giữa các dòng text
  },
  movieTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#D1D1D6", // Tông xám sáng giúp người dùng đọc tốt trên nền tối
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 60,
    fontStyle: "italic",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});
