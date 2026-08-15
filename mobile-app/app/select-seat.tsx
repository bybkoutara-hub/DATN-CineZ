import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import api from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212";
const PRIMARY_YELLOW = "#FCC434";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";

// Màu chuẩn layout (đồng bộ web + app):
const STANDARD_SEAT = "#6B21A8";
const VIP_SEAT = "#e8f712";
const COUPLE_SEAT = "#EC4899";
const RESERVED_COLOR = "#374151";
const MAINTENANCE_SEAT = "#1F2937";
const CENTER_BORDER = "#22C55E";

const PADDING_CONTAINER = 12;
const SEAT_GAP = 3;

const rowLabelWidth = 22;

// ==================== LAYOUT (đồng bộ với api/utils/seatLayout.ts) ====================

// Layout chuẩn: 8 hàng A-H, đánh số ngược (15 trái -> 01 phải)
const DEFAULT_LAYOUT = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 15,
  numbering: "reverse",
  rowTypes: {
    A: "standard",
    B: "standard",
    C: "standard",
    D: "vip",
    E: "vip",
    F: "vip",
    G: "vip",
    H: "couple",
  },
  rowStartNumbers: {
    A: 14,
    B: 15,
    C: 15,
    D: 13,
    E: 14,
    F: 14,
    G: 15,
    H: 12,
  },
  centerZone: {
    rows: ["C", "D", "E", "F"],
    cols: [5, 6, 7, 8, 9, 10, 11],
  },
};

type SeatType = "standard" | "vip" | "couple";

interface LayoutConfig {
  rows: string[];
  cols: number;
  numbering: "forward" | "reverse";
  rowTypes: Record<string, SeatType>;
  rowStartNumbers: Record<string, number>;
  centerZone: { rows: string[]; cols: number[] } | null;
}

function getRowSeatNumbers(layout: LayoutConfig, row: string): number[] {
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const nums: number[] = [];
  for (let n = start; n >= 1; n--) nums.push(n);
  return layout.numbering === "reverse" ? nums : nums.reverse();
}

function getCouplePairs(layout: LayoutConfig, row: string): [number, number][] | null {
  if ((layout.rowTypes?.[row] || "standard") !== "couple") return null;
  const start = layout.rowStartNumbers?.[row] ?? layout.cols;
  const pairs: [number, number][] = [];
  for (let n = start; n >= 2; n -= 2) pairs.push([n, n - 1]);
  return layout.numbering === "reverse" ? pairs : pairs.reverse();
}

function isCenterSeat(layout: LayoutConfig, row: string, number: number): boolean {
  const zone = layout.centerZone;
  if (!zone) return false;
  return zone.rows.includes(row) && zone.cols.includes(number);
}

function getSeatType(layout: LayoutConfig, row: string): SeatType {
  return layout.rowTypes?.[row] || "standard";
}

function getSeatColor(
  seatType: SeatType,
  isReserved: boolean,
  isSelected: boolean,
  isMaintenance = false
): string {
  if (isMaintenance) return MAINTENANCE_SEAT;
  if (isReserved) return RESERVED_COLOR;
  if (isSelected) return PRIMARY_YELLOW;
  const map: Record<SeatType, string> = {
    standard: STANDARD_SEAT,
    vip: VIP_SEAT,
    couple: COUPLE_SEAT,
  };
  return map[seatType];
}

export default function SelectSeatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showtimeId, movieTitle, moviePoster } = useLocalSearchParams();

  const [showtimeData, setShowtimeData] = useState<any>(null);
  const [availableSeats, setAvailableSeats] = useState<Set<string>>(new Set());
  const [maintenanceSeats, setMaintenanceSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState(70000);

  const scrollRef = useRef<ScrollView>(null);

  const layout: LayoutConfig = useMemo(
    () =>
      showtimeData?.layout &&
      Array.isArray(showtimeData.layout.rows) &&
      showtimeData.layout.rows.length > 0 &&
      showtimeData.layout.cols
        ? showtimeData.layout
        : DEFAULT_LAYOUT,
    [showtimeData]
  );

  const cols = layout.cols;
  const availWidth =
    SCREEN_WIDTH - PADDING_CONTAINER * 2 - rowLabelWidth;
  const SEAT_SIZE = Math.floor(availWidth / cols) - SEAT_GAP;
  const COUPLE_WIDTH = SEAT_SIZE * 2 + SEAT_GAP;

  useEffect(() => {
    if (showtimeId) {
      const fetchShowtimeDetail = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/movies/showtimes/${showtimeId}`);
          const data = response.data.data || response.data;
          setShowtimeData(data);
          if (data.price) setTicketPrice(data.price);
          if (data.maintenanceSeats && Array.isArray(data.maintenanceSeats)) {
            setMaintenanceSeats(new Set(data.maintenanceSeats));
          }
          if (data.availableSeats && Array.isArray(data.availableSeats)) {
            setAvailableSeats(new Set(data.availableSeats));
          } else if (data.bookedSeats && Array.isArray(data.bookedSeats)) {
            const booked = new Set<string>(data.bookedSeats);
            const all: string[] = [];
            const seatLayout: LayoutConfig =
              data.layout && Array.isArray(data.layout.rows) ? data.layout : DEFAULT_LAYOUT;
            seatLayout.rows.forEach((r) => {
              getRowSeatNumbers(seatLayout, r).forEach((n) => all.push(`${r}${n}`));
            });
            setAvailableSeats(new Set(all.filter((s) => !booked.has(s))));
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin suất chiếu:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchShowtimeDetail();
    }
  }, [showtimeId]);

  const total = useMemo(
    () => selectedSeats.length * ticketPrice,
    [selectedSeats, ticketPrice]
  );

  const toggleSeat = (seat: string) => {
    if (!availableSeats.has(seat) || maintenanceSeats.has(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const toggleCoupleSeat = (row: string, pair: [number, number]) => {
    const pairIds = pair.map((n) => `${row}${n}`);
    const bothAvailable = pairIds.every((s) => availableSeats.has(s));
    const bothUsable = pairIds.every((s) => !maintenanceSeats.has(s));
    if (!bothAvailable || !bothUsable) return;
    const allSelected = pairIds.every((s) => selectedSeats.includes(s));
    if (allSelected) {
      setSelectedSeats((prev) => prev.filter((s) => !pairIds.includes(s)));
    } else {
      setSelectedSeats((prev) => {
        const next = new Set(prev);
        pairIds.forEach((s) => next.add(s));
        return Array.from(next);
      });
    }
  };

  const renderSingleSeat = (row: string, number: number) => {
    const seat = `${row}${number}`;
    const isMaintenance = maintenanceSeats.has(seat);
    const isReserved = !availableSeats.has(seat);
    const isSelected = selectedSeats.includes(seat);
    const seatType = getSeatType(layout, row);
    const isCenter = isCenterSeat(layout, row, number);
    const bg = getSeatColor(seatType, isReserved, isSelected, isMaintenance);

    return (
      <TouchableOpacity
        key={seat}
        activeOpacity={isReserved || isMaintenance ? 1 : 0.7}
        onPress={() => toggleSeat(seat)}
        disabled={isReserved || isMaintenance}
        style={[
          styles.seat,
          {
            width: SEAT_SIZE,
            height: SEAT_SIZE,
            backgroundColor: bg,
            borderColor: isCenter ? CENTER_BORDER : isSelected ? PRIMARY_YELLOW : "transparent",
            borderWidth: isCenter ? 1.5 : 1.2,
            opacity: isMaintenance ? 0.55 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.seatLabel,
            {
              fontSize: Math.min(SEAT_SIZE * 0.4, 9),
              color: isSelected ? BACKGROUND_BLACK : isMaintenance ? "#4B5563" : TEXT_LIGHT,
            },
          ]}
        >
          {number}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCoupleSeat = (row: string, pair: [number, number]) => {
    const pairIds = pair.map((n) => `${row}${n}`);
    const bothAvailable = pairIds.every((s) => availableSeats.has(s));
    const allSelected = pairIds.every((s) => selectedSeats.includes(s));
    const anyReserved = pairIds.some((s) => !availableSeats.has(s));
    const anyMaintenance = pairIds.some((s) => maintenanceSeats.has(s));
    const bg = allSelected
      ? PRIMARY_YELLOW
      : anyMaintenance
      ? MAINTENANCE_SEAT
      : anyReserved
      ? RESERVED_COLOR
      : COUPLE_SEAT;

    return (
      <TouchableOpacity
        key={pairIds[0]}
        activeOpacity={anyReserved || anyMaintenance ? 1 : 0.7}
        onPress={() => toggleCoupleSeat(row, pair)}
        disabled={anyReserved || anyMaintenance}
        style={[
          styles.coupleSeat,
          {
            width: COUPLE_WIDTH,
            height: SEAT_SIZE,
            backgroundColor: bg,
            borderColor: allSelected ? PRIMARY_YELLOW : "transparent",
            opacity: anyMaintenance ? 0.55 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.coupleLabel,
            { color: allSelected ? BACKGROUND_BLACK : anyMaintenance ? "#4B5563" : TEXT_LIGHT },
          ]}
        >
          {pair[0]}-{pair[1]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (row: string) => {
    const isCoupleRow = getSeatType(layout, row) === "couple";
    const start = layout.rowStartNumbers?.[row] ?? cols;
    const emptyLeft = layout.numbering === "reverse" ? cols - start : 0;
    const emptyRight = layout.numbering === "forward" ? cols - start : 0;
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < emptyLeft; i++) {
      cells.push(
        <View
          key={`${row}-e${i}`}
          style={[styles.seat, styles.seatEmpty, { width: SEAT_SIZE, height: SEAT_SIZE }]}
        />
      );
    }

    if (isCoupleRow) {
      const pairs = getCouplePairs(layout, row)!;
      pairs.forEach((pair) => cells.push(renderCoupleSeat(row, pair)));
    } else {
      getRowSeatNumbers(layout, row).forEach((n) =>
        cells.push(renderSingleSeat(row, n))
      );
    }

    for (let i = 0; i < emptyRight; i++) {
      cells.push(
        <View
          key={`${row}-er${i}`}
          style={[styles.seat, styles.seatEmpty, { width: SEAT_SIZE, height: SEAT_SIZE }]}
        />
      );
    }

    return (
      <View key={row} style={styles.rowContainer}>
        <Text style={styles.rowLabel}>{row}</Text>
        <View style={styles.rowSeats}>{cells}</View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
        <Text style={{ color: TEXT_MUTED, marginTop: 12, fontSize: 14 }}>
          Đang tải sơ đồ ghế...
        </Text>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
            <Ionicons name="chevron-back" size={26} color={TEXT_LIGHT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn ghế</Text>
          <View style={{ width: 40 }} />
        </View>

        {showtimeData && (
          <View style={styles.infoSummary}>
            <Text style={styles.roomLabel}>
              Phòng: {showtimeData.roomName || "Phòng chiếu"}
            </Text>
            <Text style={styles.timeLabel}>
              Suất:{" "}
              {showtimeData.startTime
                ? new Date(showtimeData.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Đang cập nhật"}
            </Text>
          </View>
        )}

        <View style={styles.screenContainer}>
          <View style={styles.screenArc} />
          <View style={styles.screenGlow} />
          <Text style={styles.screenLabel}>MÀN HÌNH</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridScrollContent}
        >
          <View style={styles.seatsGrid}>
            {layout.rows.map((row) => renderRow(row))}
          </View>
        </ScrollView>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STANDARD_SEAT }]} />
            <Text style={styles.legendText}>Ghế Thường</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: VIP_SEAT }]} />
            <Text style={styles.legendText}>Ghế VIP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COUPLE_SEAT }]} />
            <Text style={styles.legendText}>Ghế Đôi</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1.5,
                  borderColor: CENTER_BORDER,
                },
              ]}
            />
            <Text style={styles.legendText}>Vùng Trung Tâm</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: RESERVED_COLOR }]} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: MAINTENANCE_SEAT, opacity: 0.55 }]}
            />
            <Text style={styles.legendText}>Bảo trì</Text>
          </View>
        </View>

        <View style={styles.tooltipRow}>
          <Ionicons name="information-circle-outline" size={14} color={TEXT_MUTED} />
          <Text style={styles.tooltipText}>
            Chạm vào ghế để chọn hoặc bỏ chọn
          </Text>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

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
            selectedSeats.length === 0 && { backgroundColor: "#3A3A3C" },
          ]}
          activeOpacity={0.85}
          disabled={selectedSeats.length === 0}
          onPress={() => {
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
          <Text
            style={[
              styles.buyButtonText,
              selectedSeats.length === 0 && { color: "#8E8E93" },
            ]}
          >
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
    marginBottom: 28,
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
  gridScrollContent: {
    paddingHorizontal: PADDING_CONTAINER,
  },
  seatsGrid: {
    marginBottom: 28,
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rowLabel: {
    width: rowLabelWidth,
    fontSize: 12,
    fontWeight: "600",
    color: "#555559",
    textAlign: "left",
  },
  rowSeats: {
    flexDirection: "row",
    alignItems: "center",
  },
  seat: {
    borderRadius: 4,
    borderWidth: 1.2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SEAT_GAP / 2,
  },
  seatEmpty: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  seatLabel: {
    fontWeight: "700",
  },
  coupleSeat: {
    borderRadius: 4,
    borderWidth: 1.2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SEAT_GAP / 2,
  },
  coupleLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  tooltipRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tooltipText: {
    fontSize: 11,
    color: TEXT_MUTED,
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
