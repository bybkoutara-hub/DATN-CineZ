import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";
const PRIMARY_YELLOW = "#FCC444";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#888888";
const RESERVED_COLOR = "#2B2B2F";
const SELECTED_COLOR = "#FCC444";
const AVAILABLE_BORDER = "#333333";

const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seatColumns = Array.from({ length: 13 }, (_, index) => index + 1);

const reservedSeats = new Set([
  "A5",
  "A6",
  "A7",
  "B7",
  "B8",
  "C6",
  "C7",
  "C8",
  "D4",
  "D5",
  "D6",
  "D9",
  "E5",
  "E6",
  "F3",
  "G3",
  "H6",
  "H7",
  "I5",
  "I6",
  "J4",
  "J5",
]);

const initialSelected = new Set(["D7", "D8", "E7", "E8"]);
const dates = ["Dec 08", "Dec 09", "Dec 10", "Dec 11", "Dec 12"];
const times = ["11:05", "14:15", "16:30"];

export default function SelectSeatScreen() {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    Array.from(initialSelected)
  );
  const [selectedDate, setSelectedDate] = useState("Dec 10");
  const [selectedTime, setSelectedTime] = useState("14:15");

  const total = useMemo(() => selectedSeats.length * 70000, [selectedSeats]);

  const toggleSeat = (seat: string) => {
    if (reservedSeats.has(seat)) {
      return;
    }
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((item) => item !== seat);
      }
      return [...prev, seat];
    });
  };

  const renderSeat = (seat: string) => {
    const isReserved = reservedSeats.has(seat);
    const isSelected = selectedSeats.includes(seat);
    const seatStyle: StyleProp<ViewStyle>[] = [styles.seatItem];
    const seatTextStyle: StyleProp<TextStyle>[] = [styles.seatText];

    if (isReserved) {
      seatStyle.push(styles.seatReserved);
      seatTextStyle.push(styles.seatTextReserved);
    } else if (isSelected) {
      seatStyle.push(styles.seatSelected);
      seatTextStyle.push(styles.seatTextSelected);
    }

    return (
      <TouchableOpacity
        key={seat}
        activeOpacity={isReserved ? 1 : 0.7}
        style={seatStyle}
        onPress={() => toggleSeat(seat)}
        disabled={isReserved}
      >
        <Text style={seatTextStyle}>{seat}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select seat</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Screen Visualization */}
        <View style={styles.screenContainer}>
          <View style={styles.screenTopWrapper}>
            <View style={styles.trapezoid} />
            <View style={styles.trapezoidGlow} />
          </View>
          <Text style={styles.screenLabel}>SCREEN</Text>
        </View>

        {/* Seats Grid */}
        <View style={styles.seatsContainer}>
          {seatRows.map((row) => (
            <View key={row} style={styles.rowContainer}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.rowSeats}>
                {seatColumns.map((column) => {
                  const seatId = `${row}${column}`;
                  const isAisle = column === 7;
                  return (
                    <View
                      key={seatId}
                      style={isAisle ? styles.aisle : styles.seatWrapper}
                    >
                      {renderSeat(seatId)}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
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

        {/* Date & Time Section */}
        <Text style={styles.sectionTitle}>Select Date & Time</Text>

        {/* Date Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dates.map((date) => {
            const isActive = date === selectedDate;
            const dateParts = date.split(" ");
            return (
              <TouchableOpacity
                key={date}
                onPress={() => setSelectedDate(date)}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    isActive && styles.dateChipTextActive,
                  ]}
                >
                  {dateParts[1]}
                </Text>
                <Text
                  style={[
                    styles.dateChipSubText,
                    isActive && styles.dateChipSubTextActive,
                  ]}
                >
                  {dateParts[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Chips */}
        <View style={styles.timeRow}>
          {times.map((time) => {
            const isActive = time === selectedTime;
            return (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[styles.timeChip, isActive && styles.timeChipActive]}
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

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {(total / 1000).toLocaleString("vi-VN")}K VND
          </Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.8}
          onPress={() => router.push("/payment")}
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
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },

  // Screen Visualization
  screenContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: SURFACE_DARK,
    borderRadius: 12,
    overflow: "hidden",
    paddingVertical: 16,
    alignItems: "center",
  },
  screenTopWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  trapezoid: {
    width: '82%',
    height: 0,
    borderLeftWidth: (width * 0.82) * 0.12,
    borderRightWidth: (width * 0.82) * 0.12,
    borderBottomWidth: 34,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: PRIMARY_YELLOW,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: PRIMARY_YELLOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 6,
  },
  trapezoidGlow: {
    position: 'absolute',
    top: 6,
    width: '76%',
    height: 10,
    backgroundColor: 'rgba(255,200,70,0.08)',
    borderRadius: 6,
  },
  screenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 1.5,
  },

  // Seats Container
  seatsContainer: {
    marginHorizontal: 24,
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rowLabel: {
    width: 24,
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_LIGHT,
    marginRight: 10,
    textAlign: "center",
  },
  rowSeats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  seatWrapper: {
    width: 34,
    marginHorizontal: 3,
    alignItems: "center",
  },
  seatItem: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AVAILABLE_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACKGROUND_BLACK,
  },
  seatSelected: {
    backgroundColor: PRIMARY_YELLOW,
    borderColor: PRIMARY_YELLOW,
    shadowColor: PRIMARY_YELLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  seatReserved: {
    backgroundColor: RESERVED_COLOR,
    borderColor: RESERVED_COLOR,
  },
  seatText: {
    fontSize: 10,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },
  seatTextReserved: {
    color: "#555555",
  },
  seatTextSelected: {
    color: BACKGROUND_BLACK,
  },
  aisle: {
    width: 20,
    alignItems: "center",
    marginHorizontal: 3,
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: SURFACE_DARK,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
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
    backgroundColor: BACKGROUND_BLACK,
    borderWidth: 1,
    borderColor: AVAILABLE_BORDER,
  },
  legendReserved: {
    backgroundColor: RESERVED_COLOR,
  },
  legendSelected: {
    backgroundColor: SELECTED_COLOR,
  },
  legendText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },

  // Date & Time Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_LIGHT,
    marginHorizontal: 24,
    marginBottom: 16,
  },

  // Date Scroll
  dateScroll: {
    marginBottom: 20,
  },
  dateScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateChip: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SURFACE_DARK,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateChipActive: {
    backgroundColor: PRIMARY_YELLOW,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  dateChipText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  dateChipTextActive: {
    color: BACKGROUND_BLACK,
  },
  dateChipSubText: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 2,
    fontWeight: "600",
  },
  dateChipSubTextActive: {
    color: BACKGROUND_BLACK,
  },

  // Time Row
  timeRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    gap: 12,
    marginBottom: 8,
  },
  timeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: SURFACE_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipActive: {
    backgroundColor: PRIMARY_YELLOW,
    borderWidth: 0,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_LIGHT,
  },
  timeChipTextActive: {
    color: BACKGROUND_BLACK,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BACKGROUND_BLACK,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_YELLOW,
    marginTop: 6,
  },
  buyButton: {
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: BACKGROUND_BLACK,
  },
});
