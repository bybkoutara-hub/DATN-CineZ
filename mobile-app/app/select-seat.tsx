import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import api from "../services/api"; // Đảm bảo đường dẫn này trỏ đúng đến cấu hình Axios của bạn

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Bảng màu chuẩn tuyệt đối theo thiết kế Dark-Mode Figma
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212"; 
const CHIP_DARK = "#1C1C1F"; 
const PRIMARY_YELLOW = "#FCC434"; 
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const RESERVED_COLOR = "#262629"; 
const AVAILABLE_BORDER = "#3A3A3C"; 

// Tính toán kích thước ô ghế vừa vặn chuẩn tỉ lệ màn hình thiết bị
const PADDING_CONTAINER = 20 * 2;
const AISLE_GAP = 14;
const DEFAULT_COLS = 12;

export default function SelectSeatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showtimeId, movieTitle, moviePoster } = useLocalSearchParams(); // Nhận từ màn movie-detail

  // Các State quản lý dữ liệu API
  const [showtimeData, setShowtimeData] = useState<any>(null);
  const [roomConfig, setRoomConfig] = useState<{ rows_count: number; seats_per_row: number } | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // State tương tác của người dùng
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState(70000);

  // Sinh động số hàng/cột từ room config (fallback 10 hàng, 12 cột)
  const seatRows = useMemo(() => {
    const count = roomConfig?.rows_count || 10;
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
  }, [roomConfig]);

  const seatColumns = useMemo(() => {
    const count = roomConfig?.seats_per_row || DEFAULT_COLS;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [roomConfig]);

  // Kích thước ô ghế tính động theo số cột thực tế
  const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_CONTAINER - AISLE_GAP - 24;
  const SEAT_SIZE = Math.floor(AVAILABLE_WIDTH / (roomConfig?.seats_per_row || DEFAULT_COLS));

  // Gọi API lấy thông tin suất chiếu + phòng
  useEffect(() => {
    if (showtimeId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/movies/showtimes/${showtimeId}`);
          const data = response.data.data || response.data;
          setShowtimeData(data);
          if (data.price) setTicketPrice(data.price);

          if (data.availableSeats && Array.isArray(data.availableSeats)) {
            setAvailableSeats(new Set(data.availableSeats));
          }

          if (data.roomName) {
            try {
              const roomRes = await api.get(`/rooms/${encodeURIComponent(data.roomName)}`);
              if (roomRes.data?.success && roomRes.data?.data) {
                setRoomConfig(roomRes.data.data);
              }
            } catch {
            }
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin suất chiếu:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [showtimeId]);

  // Tính toán tổng tiền dựa trên độ dài mảng ghế đang chọn và giá vé thực tế từ API
  const total = useMemo(() => selectedSeats.length * ticketPrice, [selectedSeats, ticketPrice]);

  const toggleSeat = (seat: string) => {
    // Nếu ghế không nằm trong danh sách availableSeats nghĩa là ghế đã bị đặt trước (Reserved)
    if (!availableSeats.has(seat)) return; 
    
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((item) => item !== seat)
        : [...prev, seat],
    );
  };

  const renderSeat = (seat: string) => {
    // Ghế đã đặt (Reserved) là ghế KHÔNG nằm trong danh sách ghế trống khả dụng từ Server
    const isReserved = !availableSeats.has(seat);
    const isSelected = selectedSeats.includes(seat);

    return (
      <TouchableOpacity
        key={seat}
        activeOpacity={isReserved ? 1 : 0.7}
        style={[
          styles.seatItem,
          { width: SEAT_SIZE, height: SEAT_SIZE },
          isReserved && styles.seatReserved,
          isSelected && styles.seatSelected,
        ]}
        onPress={() => toggleSeat(seat)}
        disabled={isReserved}
      />
    );
  };

  // Màn hình hiển thị xoay tròn trong lúc đợi API trả về kết quả
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
        <Text style={{ color: TEXT_MUTED, marginTop: 12, fontSize: 14 }}>Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header đúng font-style Figma */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={26} color={TEXT_LIGHT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn ghế</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Thông tin phòng chiếu / Suất chiếu từ API */}
        {showtimeData && (
          <View style={styles.infoSummary}>
            <Text style={styles.roomLabel}>
              Phòng: {showtimeData.roomName || "Phòng chiếu"}
            </Text>
            <Text style={styles.timeLabel}>
              Suất: {showtimeData.startTime ? new Date(showtimeData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Đang cập nhật"}
            </Text>
          </View>
        )}

        {/* Giả lập màn hình vòng cung cong mảnh hắt sáng nhẹ */}
        <View style={styles.screenContainer}>
          <View style={styles.screenArc} />
          <View style={styles.screenGlow} />
          <Text style={styles.screenLabel}>MÀN HÌNH</Text>
        </View>

        {/* Lưới chọn ghế thoáng sạch */}
        <View style={styles.seatsGrid}>
          {seatRows.map((row) => (
            <View key={row} style={styles.rowContainer}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.rowSeats}>
                  {seatColumns.map((column, index) => {
                    const seatId = `${row}${column}`;
                    const aisleCol = Math.floor(seatColumns.length / 2);
                    return (
                      <React.Fragment key={seatId}>
                        {index === aisleCol && <View style={styles.aisleSpacer} />}
                        {renderSeat(seatId)}
                      </React.Fragment>
                    );
                  })}
              </View>
            </View>
          ))}
        </View>

        {/* Chú thích trạng thái ghế (Legend) nằm ngang trải rộng */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendAvailable]} />
            <Text style={styles.legendText}>Còn trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendReserved]} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendSelected]} />
            <Text style={styles.legendText}>Đang chọn</Text>
          </View>
        </View>

        {/* Khoảng trống đệm an toàn tránh đè Bottom Bar */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Thanh thanh toán Bottom Bar bo tròn ôm mượt viền dưới chân rạp */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>
            Tổng {selectedSeats.length > 0 ? `(${selectedSeats.length} ghế)` : ""}
          </Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.buyButton,
            selectedSeats.length === 0 && { backgroundColor: "#3A3A3C" }
          ]}
          activeOpacity={0.85}
          disabled={selectedSeats.length === 0}
          onPress={() => {
            // Chuyển hướng sang màn hình chọn Combo, truyền kèm thông tin đặt chỗ hiện tại
            router.push({
              pathname: "/combo",
              params: {
                showtimeId: showtimeId,
                seats: selectedSeats.join(","),
                totalPrice: total,
                movieTitle: movieTitle,
                moviePoster: moviePoster,
                roomName: showtimeData?.roomName || "",
                startTime: showtimeData?.startTime || "",
              },
            });
          }}
        >
          <Text style={[
            styles.buyButtonText,
            selectedSeats.length === 0 && { color: "#8E8E93" }
          ]}>
            Mua vé
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  scrollContent: {
    paddingTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_LIGHT,
    letterSpacing: 0.2,
  },
  infoSummary: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 10,
  },
  roomLabel: {
    color: PRIMARY_YELLOW,
    fontSize: 13,
    fontWeight: "600",
  },
  timeLabel: {
    color: TEXT_LIGHT,
    fontSize: 13,
    fontWeight: "600",
  },
  screenContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 36,
    alignItems: "center",
    position: "relative",
  },
  screenArc: {
    width: "85%",
    height: 3.5,
    backgroundColor: PRIMARY_YELLOW,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  screenGlow: {
    position: "absolute",
    top: 3.5,
    width: "75%",
    height: 30,
    backgroundColor: "rgba(252, 196, 52, 0.08)",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  screenLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#444446",
    letterSpacing: 5,
    marginTop: 16,
  },
  seatsGrid: {
    marginHorizontal: 20,
    marginBottom: 28,
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  rowLabel: {
    width: 20,
    fontSize: 12,
    fontWeight: "600",
    color: "#555559",
    textAlign: "left",
  },
  rowSeats: {
    flexDirection: "row",
    alignItems: "center",
  },
  seatItem: {
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: AVAILABLE_BORDER,
    backgroundColor: CHIP_DARK,
    marginHorizontal: 2.5,
  },
  seatSelected: {
    backgroundColor: PRIMARY_YELLOW,
    borderColor: PRIMARY_YELLOW,
  },
  seatReserved: {
    backgroundColor: RESERVED_COLOR,
    borderColor: RESERVED_COLOR,
  },
  aisleSpacer: {
    width: AISLE_GAP,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 36,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendAvailable: {
    backgroundColor: CHIP_DARK,
    borderWidth: 1.2,
    borderColor: AVAILABLE_BORDER,
  },
  legendReserved: {
    backgroundColor: RESERVED_COLOR,
  },
  legendSelected: {
    backgroundColor: PRIMARY_YELLOW,
  },
  legendText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SURFACE_DARK,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1F",
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  priceContainer: {
    flexDirection: "column",
  },
  totalLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 24, 
    paddingHorizontal: 36,
    paddingVertical: 14,
    minWidth: 150,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(252, 196, 52, 0.2)",
      },
    }),
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: BACKGROUND_BLACK,
  },
});