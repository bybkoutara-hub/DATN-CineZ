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
const CHIP_DARK = "#1C1C1F";
const PRIMARY_YELLOW = "#FCC434";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const RESERVED_COLOR = "#262629";

const REGULAR_SEAT = "#3C4753";
const VIP_SEAT = "#F3A000";
const COUPLE_SEAT = "#E83F93";
const MAINTENANCE_SEAT = "#2A2A2E";
const BROKEN_SEAT = "#FF3B30";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const COLS = 18;
const PADDING_CONTAINER = 12;
const AISLE_GAP = 14;
const SEAT_GAP = 3;

const rowLabelWidth = 22;
const availWidth = SCREEN_WIDTH - PADDING_CONTAINER * 2 - rowLabelWidth - AISLE_GAP;
const SEAT_SIZE = Math.floor(availWidth / COLS) - SEAT_GAP;
const COUPLE_WIDTH = SEAT_SIZE * 2 + SEAT_GAP;

type SeatType = "regular" | "vip" | "couple";

interface CoupleConfig {
  row: string;
  startCol: number;
  pairs: number;
}

const coupleLayout: CoupleConfig[] = [
  { row: "A", startCol: 1, pairs: 3 },
  { row: "B", startCol: 1, pairs: 3 },
  { row: "C", startCol: 1, pairs: 2 },
  { row: "D", startCol: 1, pairs: 2 },
  { row: "E", startCol: 1, pairs: 1 },
  { row: "F", startCol: 1, pairs: 1 },
];

function isCoupleSeat(row: string, col: number): boolean {
  const config = coupleLayout.find((c) => c.row === row);
  if (!config) return false;
  for (let p = 0; p < config.pairs; p++) {
    const c1 = config.startCol + p * 2;
    const c2 = c1 + 1;
    if (col === c1 || col === c2) return true;
  }
  return false;
}

function getSeatType(row: string, col: number): SeatType {
  if (row === "J") return "vip";
  if (isCoupleSeat(row, col)) return "couple";
  return "regular";
}

function getSeatColor(seatType: SeatType, isReserved: boolean, isSelected: boolean): string {
  if (isReserved) return RESERVED_COLOR;
  if (isSelected) return PRIMARY_YELLOW;
  const map: Record<SeatType, string> = {
    regular: REGULAR_SEAT,
    vip: VIP_SEAT,
    couple: COUPLE_SEAT,
  };
  return map[seatType];
}

function getRowSeatIds(row: string): string[] {
  const ids: string[] = [];
  for (let c = 1; c <= COLS; c++) ids.push(`${row}${c}`);
  return ids;
}

function getCouplePairSeats(row: string, col: number): string[] | null {
  const config = coupleLayout.find((c) => c.row === row);
  if (!config) return null;
  for (let p = 0; p < config.pairs; p++) {
    const c1 = config.startCol + p * 2;
    const c2 = c1 + 1;
    if (col === c1 || col === c2) return [`${row}${c1}`, `${row}${c2}`];
  }
  return null;
}

export default function SelectSeatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showtimeId, movieTitle, moviePoster } = useLocalSearchParams();

  const [showtimeData, setShowtimeData] = useState<any>(null);
  const [availableSeats, setAvailableSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState(70000);

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsets = useRef<Record<string, number>>({});

  useEffect(() => {
    if (showtimeId) {
      const fetchShowtimeDetail = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/movies/showtimes/${showtimeId}`);
          const data = response.data.data || response.data;
          setShowtimeData(data);
          if (data.price) setTicketPrice(data.price);
          if (data.availableSeats && Array.isArray(data.availableSeats)) {
            setAvailableSeats(new Set(data.availableSeats));
          } else if (data.bookedSeats && Array.isArray(data.bookedSeats)) {
            const booked = new Set<string>(data.bookedSeats);
            const all: string[] = [];
            ROWS.forEach((r) => {
              for (let c = 1; c <= COLS; c++) all.push(`${r}${c}`);
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
    if (!availableSeats.has(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const toggleCoupleSeat = (row: string, col: number) => {
    const pair = getCouplePairSeats(row, col);
    if (!pair) return;
    const bothAvailable = pair.every((s) => availableSeats.has(s));
    if (!bothAvailable) return;
    const allSelected = pair.every((s) => selectedSeats.includes(s));
    if (allSelected) {
      setSelectedSeats((prev) => prev.filter((s) => !pair.includes(s)));
    } else {
      setSelectedSeats((prev) => {
        const next = new Set(prev);
        pair.forEach((s) => next.add(s));
        return Array.from(next);
      });
    }
  };

  const renderSingleSeat = (row: string, col: number) => {
    const seat = `${row}${col}`;
    const isReserved = !availableSeats.has(seat);
    const isSelected = selectedSeats.includes(seat);
    const seatType = getSeatType(row, col);
    const bg = getSeatColor(seatType, isReserved, isSelected);

    return (
      <TouchableOpacity
        key={seat}
        activeOpacity={isReserved ? 1 : 0.7}
        onPress={() => toggleSeat(seat)}
        disabled={isReserved}
        style={[
          styles.seat,
          {
            width: SEAT_SIZE,
            height: SEAT_SIZE,
            backgroundColor: bg,
            borderColor: isSelected ? PRIMARY_YELLOW : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.seatLabel,
            {
              fontSize: Math.min(SEAT_SIZE * 0.4, 9),
              color: isSelected ? BACKGROUND_BLACK : TEXT_LIGHT,
            },
          ]}
        >
          {col}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCoupleSeat = (row: string, col: number) => {
    const pair = getCouplePairSeats(row, col);
    if (!pair) return null;
    const firstCol = parseInt(pair[0].slice(1));
    if (col !== firstCol) return null;

    const bothAvailable = pair.every((s) => availableSeats.has(s));
    const allSelected = pair.every((s) => selectedSeats.includes(s));
    const anyReserved = pair.some((s) => !availableSeats.has(s));
    const bg = allSelected
      ? PRIMARY_YELLOW
      : anyReserved
      ? RESERVED_COLOR
      : COUPLE_SEAT;

    return (
      <TouchableOpacity
        key={pair[0]}
        activeOpacity={anyReserved ? 1 : 0.7}
        onPress={() => toggleCoupleSeat(row, firstCol)}
        disabled={anyReserved}
        style={[
          styles.coupleSeat,
          {
            width: COUPLE_WIDTH,
            height: SEAT_SIZE,
            backgroundColor: bg,
            borderColor: allSelected ? PRIMARY_YELLOW : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.coupleLabel,
            { color: allSelected ? BACKGROUND_BLACK : TEXT_LIGHT },
          ]}
        >
          {pair[0].slice(1)}-{pair[1].slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSeat = (row: string, col: number) => {
    const seatType = getSeatType(row, col);
    if (seatType === "couple") return renderCoupleSeat(row, col);
    return renderSingleSeat(row, col);
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
            {ROWS.map((row) => {
              const seatIds = getRowSeatIds(row);
              const hasCouple = coupleLayout.some((c) => c.row === row);
              return (
                <View key={row} style={styles.rowContainer}>
                  <Text style={styles.rowLabel}>{row}</Text>
                  <View style={styles.rowSeats}>
                    {seatIds.map((seat, index) => {
                      const col = index + 1;
                      const seatType = getSeatType(row, col);
                      if (seatType === "couple") {
                        const pair = getCouplePairSeats(row, col);
                        const firstCol = parseInt(pair![0].slice(1));
                        if (col !== firstCol) return null;
                      }
                      return (
                        <React.Fragment key={seat}>
                          {index === 9 && <View style={styles.aisleSpacer} />}
                          {renderSeat(row, col)}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: REGULAR_SEAT }]} />
            <Text style={styles.legendText}>Ghế Thường</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: VIP_SEAT }]} />
            <Text style={styles.legendText}>Ghế VIP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COUPLE_SEAT }]} />
            <Text style={styles.legendText}>Ghế Couple</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MAINTENANCE_SEAT }]} />
            <Text style={styles.legendText}>Bảo trì</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BROKEN_SEAT }]} />
            <Text style={styles.legendText}>Hỏng</Text>
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
  aisleSpacer: {
    width: AISLE_GAP,
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
