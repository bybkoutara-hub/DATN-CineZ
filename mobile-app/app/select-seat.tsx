import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Bảng màu chuẩn tuyệt đối theo thiết kế Dark-Mode Figma
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212"; // Nền thanh bottom bar
const CHIP_DARK = "#1C1C1F"; // Nền xám tối của các thẻ/ghế trống chưa chọn
const PRIMARY_YELLOW = "#FCC434"; // Màu vàng thương hiệu CineZ / MBooking
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const RESERVED_COLOR = "#262629"; // Màu ghế đã bán
const AVAILABLE_BORDER = "#3A3A3C"; // Viền mảnh bao quanh ghế trống

// Cấu hình sơ đồ ghế phòng chiếu
const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seatColumns = Array.from({ length: 12 }, (_, index) => index + 1);

// Tính toán kích thước ô ghế vừa vặn chuẩn tỉ lệ màn hình thiết bị
const PADDING_CONTAINER = 20 * 2;
const AISLE_GAP = 14;
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING_CONTAINER - AISLE_GAP - 24;
const SEAT_SIZE = Math.floor(AVAILABLE_WIDTH / 12);

const reservedSeats = new Set([
  "A5",
  "A6",
  "B7",
  "B8",
  "C6",
  "C7",
  "D4",
  "D5",
  "E5",
  "E6",
  "F3",
  "G3",
  "H6",
  "H7",
  "I5",
  "J4",
]);

const initialSelected = new Set(["E7", "E8", "F7", "F8"]);

// Cấu trúc dữ liệu Ngày chiếu chuẩn UI Figma (Thứ ở trên, ngày ở dưới)
const dates = [
  { dayOfWeek: "Thu", dateNum: "10", id: "Dec 10" },
  { dayOfWeek: "Fri", dateNum: "11", id: "Dec 11" },
  { dayOfWeek: "Sat", dateNum: "12", id: "Dec 12" },
  { dayOfWeek: "Sun", dateNum: "13", id: "Dec 13" },
  { dayOfWeek: "Mon", dateNum: "14", id: "Dec 14" },
];
const times = ["11:05", "14:15", "16:30", "19:00"];

export default function SelectSeatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    Array.from(initialSelected),
  );
  const [selectedDate, setSelectedDate] = useState("Dec 10");
  const [selectedTime, setSelectedTime] = useState("14:15");

  const total = useMemo(() => selectedSeats.length * 70000, [selectedSeats]);

  const toggleSeat = (seat: string) => {
    if (reservedSeats.has(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((item) => item !== seat)
        : [...prev, seat],
    );
  };

  const renderSeat = (seat: string) => {
    const isReserved = reservedSeats.has(seat);
    const isSelected = selectedSeats.includes(seat);

    return (
      <TouchableOpacity
        key={seat}
        activeOpacity={isReserved ? 1 : 0.7}
        style={[
          styles.seatItem,
          isReserved && styles.seatReserved,
          isSelected && styles.seatSelected,
        ]}
        onPress={() => toggleSeat(seat)}
        disabled={isReserved}
      />
    );
  };

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
          <Text style={styles.headerTitle}>Select seat</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Giả lập màn hình vòng cung cong mảnh hắt sáng nhẹ quyến rũ */}
        <View style={styles.screenContainer}>
          <View style={styles.screenArc} />
          <View style={styles.screenGlow} />
          <Text style={styles.screenLabel}>SCREEN</Text>
        </View>

        {/* Lưới chọn ghế thoáng sạch, không chứa ký tự chữ bên trong ô */}
        <View style={styles.seatsGrid}>
          {seatRows.map((row) => (
            <View key={row} style={styles.rowContainer}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.rowSeats}>
                {seatColumns.map((column, index) => {
                  const seatId = `${row}${column}`;
                  return (
                    <React.Fragment key={seatId}>
                      {/* Tạo lối đi trống chia đôi rạp sau cột số 6 */}
                      {index === 6 && <View style={styles.aisleSpacer} />}
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
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendReserved]} />
            <Text style={styles.legendText}>Reserved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendSelected]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Tiêu đề vùng chọn Suất chiếu */}
        <Text style={styles.sectionTitle}>Select Date & Time</Text>

        {/* Thanh cuộn ngang chọn Ngày dạng viên thuốc thuôn đứng */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dates.map((item) => {
            const isActive = item.id === selectedDate;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedDate(item.id)}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateChipSubText,
                    isActive && styles.dateChipSubTextActive,
                  ]}
                >
                  {item.dayOfWeek}
                </Text>
                <Text
                  style={[
                    styles.dateChipText,
                    isActive && styles.dateChipTextActive,
                  ]}
                >
                  {item.dateNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Danh sách nút Giờ chiếu */}
        <View style={styles.timeRow}>
          {times.map((time) => {
            const isActive = time === selectedTime;
            return (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[styles.timeChip, isActive && styles.timeChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    isActive && styles.timeChipTextActive,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("vi-VN")} VND
          </Text>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.85}
          onPress={() => router.push("/combo")}
        >
          <Text style={styles.buyButtonText}>Buy ticket</Text>
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
    width: SEAT_SIZE,
    height: SEAT_SIZE,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_LIGHT,
    marginHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  dateScroll: {
    marginBottom: 24,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateChip: {
    width: 62,
    height: 85,
    borderRadius: 30, // Tạo hình thon dài Capsule đúng tỉ lệ Figma
    backgroundColor: CHIP_DARK,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dateChipActive: {
    backgroundColor: PRIMARY_YELLOW,
  },
  dateChipSubText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  dateChipSubTextActive: {
    color: BACKGROUND_BLACK,
    fontWeight: "600",
  },
  dateChipText: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_LIGHT,
  },
  dateChipTextActive: {
    color: BACKGROUND_BLACK,
  },
  timeRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
  },
  timeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CHIP_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipActive: {
    backgroundColor: PRIMARY_YELLOW,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  timeChipTextActive: {
    color: BACKGROUND_BLACK,
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
    borderRadius: 24, // Bo cong tròn khối hoàn toàn của nút Buy Ticket
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
