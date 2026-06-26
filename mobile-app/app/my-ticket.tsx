import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Barcode from "react-native-barcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const BG_BLACK = "#000000";
const TEXT_LIGHT = "#FFFFFF";
const TICKET_BG = "#FFFFFF";

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

export default function MyTicketScreen() {
  const router = useRouter();

  // Nhận dữ liệu vé thật được truyền từ màn danh sách vé
  const params = useLocalSearchParams();
  const totalPrice = Number(params.totalPrice || 0);
  let combos: { name: string; quantity: number; price: number }[] = [];
  try {
    combos = params.combos ? JSON.parse(params.combos as string) : [];
  } catch {
    combos = [];
  }

  const ticket = {
    bookingId: (params.bookingId as string) || "",
    title: (params.title as string) || "Vé xem phim",
    poster:
      (params.poster as string) ||
      "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    duration: params.duration ? `${params.duration} phút` : "Đang cập nhật",
    room: (params.room as string) || "Phòng chiếu CineZ",
    time: (params.time as string) || "--:--",
    date: (params.date as string) || "--",
    seats: (params.seats as string) || "--",
    status: (params.status as string) || "",
  };

  // Giá trị mã vạch = mã đặt vé thật (booking _id). Dùng để quét nhận vé tại quầy.
  const barcodeValue = ticket.bookingId || "CINEZ-TICKET";

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      {/* THANH ĐIỀU HƯỚNG */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backTouch}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>Vé của tôi</Text>
        <View style={styles.emptyRightBlock} />
      </View>

      {/* WRAPPER CHỨA THẺ VÉ */}
      <View style={styles.ticketFlexContainer}>
        <View style={styles.fullTicketCard}>
          {/* PHẦN THÂN TRÊN CỦA VÉ */}
          <View style={styles.upperTicketBody}>
            {/* THÔNG TIN PHIM */}
            <View style={styles.movieMainRow}>
              <Image
                source={{ uri: ticket.poster }}
                style={styles.largeMoviePoster}
                resizeMode="cover"
              />
              <View style={styles.movieMainDetails}>
                <Text style={styles.moviePrimaryTitle} numberOfLines={2}>
                  {ticket.title}
                </Text>

                <View style={styles.movieMetaInlineRow}>
                  <Feather name="clock" size={16} color="#222222" />
                  <Text style={styles.movieMetaInlineText}>
                    {ticket.duration}
                  </Text>
                </View>

                <View style={styles.movieMetaInlineRow}>
                  <Feather name="video" size={16} color="#222222" />
                  <Text style={styles.movieMetaInlineText} numberOfLines={1}>
                    {ticket.room}
                  </Text>
                </View>

                {!!ticket.status && (
                  <View style={styles.statusInlineBadge}>
                    <Text style={styles.statusInlineText}>
                      {statusLabel(ticket.status)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.thinHorizontalLine} />

            {/* THỜI GIAN & SỐ GHẾ */}
            <View style={styles.bookingDataRow}>
              <View style={styles.bookingDataItem}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={34}
                  color="#000000"
                />
                <View style={styles.textDataGroup}>
                  <Text style={styles.boldDataText}>{ticket.time}</Text>
                  <Text style={styles.subDataText}>{ticket.date}</Text>
                </View>
              </View>

              <View style={styles.thinVerticalLine} />

              <View style={styles.bookingDataItem}>
                <MaterialCommunityIcons
                  name="seat-outline"
                  size={36}
                  color="#000000"
                  style={styles.customSeatIconStyle}
                />
                <View style={styles.textDataGroupLayout}>
                  <Text style={styles.mutedDataLabel}>Ghế</Text>
                  <Text style={styles.boldDataText}>{ticket.seats}</Text>
                </View>
              </View>
            </View>

            <View style={styles.thinHorizontalLine} />

            {/* CHI TIẾT GIÁ TIỀN, COMBO, RẠP */}
            <View style={styles.metaDetailsList}>
              <View style={styles.metaDetailItemRow}>
                <View style={styles.customCoinIconOuter}>
                  <FontAwesome5 name="dollar-sign" size={9} color="#000000" />
                </View>
                <Text style={styles.boldPriceValueText}>
                  {totalPrice.toLocaleString("vi-VN")} đ
                </Text>
              </View>

              {combos.length > 0 && (
                <View style={styles.metaDetailItemRowAlignTop}>
                  <MaterialCommunityIcons
                    name="popcorn"
                    size={20}
                    color="#000000"
                    style={styles.leftMetaIconWidth}
                  />
                  <Text style={styles.mutedNoticeBodyText}>
                    {combos
                      .map((c) => `${c.name} x${c.quantity}`)
                      .join(", ")}
                  </Text>
                </View>
              )}

              <View style={styles.metaDetailItemRowAlignTop}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#000000"
                  style={styles.leftMetaIconWidth}
                />
                <View style={styles.cinemaTextArea}>
                  <Text style={styles.boldCinemaName}>{ticket.room || "Rạp CineZ"}</Text>
                  <Text style={styles.mutedCinemaAddress}>
                    Vui lòng đến quầy trước giờ chiếu 15 phút để nhận vé.
                  </Text>
                </View>
              </View>

              <View style={styles.metaDetailItemRowAlignTop}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={20}
                  color="#000000"
                  style={styles.leftMetaIconWidth}
                />
                <Text style={styles.mutedNoticeBodyText}>
                  Đưa mã vạch này tại quầy vé để nhận vé của bạn.
                </Text>
              </View>
            </View>
          </View>

          {/* ĐƯỜNG RĂNG CƯA KHOÉT LÕM HAI BÊN CẠNH VÉ */}
          <View style={styles.midTicketCutOutRow}>
            <View style={styles.leftDeepCircleHole} />
            <View style={styles.centerDashedLineDivider} />
            <View style={styles.rightDeepCircleHole} />
          </View>

          {/* PHẦN CHỨA MÃ VẠCH THẬT */}
          <View style={styles.bottomBarcodeArea}>
            <Barcode
              value={barcodeValue}
              format="CODE128"
              maxWidth={SCREEN_WIDTH - 120}
              height={70}
              singleBarWidth={2}
              backgroundColor="#FFFFFF"
              lineColor="#000000"
            />
            <Text style={styles.finalOrderStringText}>
              Mã đặt vé: {ticket.bookingId || "--"}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BG_BLACK,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backTouch: {
    padding: 4,
  },
  mainHeaderTitle: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: "600",
  },
  emptyRightBlock: {
    width: 36,
  },
  ticketFlexContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: SCREEN_HEIGHT * 0.04,
    justifyContent: "center",
  },
  fullTicketCard: {
    backgroundColor: TICKET_BG,
    borderRadius: 24,
  },
  upperTicketBody: {
    padding: 24,
    paddingBottom: 0,
  },
  movieMainRow: {
    flexDirection: "row",
    gap: 20,
  },
  largeMoviePoster: {
    width: 100,
    height: 135,
    borderRadius: 16,
  },
  movieMainDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  moviePrimaryTitle: {
    color: "#000000",
    fontSize: 21,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 4,
  },
  movieMetaInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  movieMetaInlineText: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "400",
  },
  statusInlineBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  statusInlineText: {
    color: "#222222",
    fontSize: 12,
    fontWeight: "600",
  },
  thinHorizontalLine: {
    height: 1,
    backgroundColor: "#E5E5EA",
    width: "100%",
    marginVertical: 18,
  },
  bookingDataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bookingDataItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customSeatIconStyle: {
    marginRight: 2,
    marginTop: -2,
  },
  textDataGroup: {
    marginLeft: 14,
  },
  textDataGroupLayout: {
    marginLeft: 12,
  },
  boldDataText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  subDataText: {
    color: "#777777",
    fontSize: 13,
    marginTop: 3,
  },
  mutedDataLabel: {
    color: "#777777",
    fontSize: 13,
    marginBottom: 2,
  },
  thinVerticalLine: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 10,
  },
  metaDetailsList: {
    gap: 16,
  },
  metaDetailItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaDetailItemRowAlignTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftMetaIconWidth: {
    width: 28,
    textAlign: "left",
    marginTop: 1,
  },
  customCoinIconOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  boldPriceValueText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  cinemaTextArea: {
    flex: 1,
  },
  boldCinemaName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  mutedCinemaAddress: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  mutedNoticeBodyText: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  midTicketCutOutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 24,
    overflow: "hidden",
  },
  leftDeepCircleHole: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BG_BLACK,
    marginLeft: -12,
  },
  rightDeepCircleHole: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BG_BLACK,
    marginRight: -12,
  },
  centerDashedLineDivider: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    marginHorizontal: 16,
  },
  bottomBarcodeArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  finalOrderStringText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.8,
    letterSpacing: 0.5,
    marginTop: 12,
  },
});
