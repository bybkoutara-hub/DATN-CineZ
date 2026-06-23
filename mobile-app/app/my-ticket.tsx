import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BG_BLACK = "#000000";
const TEXT_LIGHT = "#FFFFFF";
const TICKET_BG = "#FFFFFF";

export default function MyTicketScreen() {
  const router = useRouter();

  const RenderPerfectBarcode = () => {
    // Chuỗi răng cưa mật độ cao (High-density) đan xen dày mỏng chuẩn cấu trúc Frame.png
    const barWeights = [
      2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 2, 4, 1, 1, 3, 1, 2, 4, 1, 2, 1, 1, 3, 2, 4,
      1, 1, 2, 3, 1, 4, 1, 2, 1, 1, 3, 2, 4, 1, 1, 2, 3, 1, 4, 1, 2, 1, 1, 3, 2,
      4, 1, 1, 2, 3, 1, 4, 1, 2, 1, 1, 3, 2, 4, 1, 1, 2, 1, 4, 3, 1, 1, 2, 1, 2,
    ];

    return (
      <View style={styles.barcodeWrapper}>
        {barWeights.map((weight, idx) => (
          <View
            key={idx}
            style={[
              styles.singleBar,
              {
                // Độ rộng của từng vạch đơn mảnh sắc nét, phủ đều bề ngang vé
                width: weight * 2,
                backgroundColor: idx % 2 === 0 ? "#000000" : "transparent",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      {/* NAVIGATION HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backTouch}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>My ticket</Text>
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
                source={{
                  uri: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
                }}
                style={styles.largeMoviePoster}
                resizeMode="cover"
              />
              <View style={styles.movieMainDetails}>
                <Text style={styles.moviePrimaryTitle}>
                  Avengers: Infinity War
                </Text>

                <View style={styles.movieMetaInlineRow}>
                  <Feather name="clock" size={16} color="#222222" />
                  <Text style={styles.movieMetaInlineText}>
                    2 hours 29 minutes
                  </Text>
                </View>

                <View style={styles.movieMetaInlineRow}>
                  <Feather name="video" size={16} color="#222222" />
                  <Text style={styles.movieMetaInlineText} numberOfLines={1}>
                    Action, adventure, sci-fi
                  </Text>
                </View>
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
                  <Text style={styles.boldDataText}>{"14h15'"}</Text>
                  <Text style={styles.subDataText}>10.12.2022</Text>
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
                  <Text style={styles.mutedDataLabel}>Section 4</Text>
                  <Text style={styles.boldDataText}>Seat H7, H8</Text>
                </View>
              </View>
            </View>

            <View style={styles.thinHorizontalLine} />

            {/* DANH SÁCH CHI TIẾT NƠI CHỐN VÀ GIÁ TIỀN */}
            <View style={styles.metaDetailsList}>
              <View style={styles.metaDetailItemRow}>
                <View style={styles.customCoinIconOuter}>
                  <FontAwesome5 name="dollar-sign" size={9} color="#000000" />
                </View>
                <Text style={styles.boldPriceValueText}>210.000 VND</Text>
              </View>

              <View style={styles.metaDetailItemRowAlignTop}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#000000"
                  style={styles.leftMetaIconWidth}
                />
                <View style={styles.cinemaTextArea}>
                  <View style={styles.cinemaHeaderInline}>
                    <Text style={styles.boldCinemaName}>
                      Vincom Ocean Park{" "}
                    </Text>
                    <Image
                      source={{
                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/CGV_Cinemas_logo.svg/512px-CGV_Cinemas_logo.svg.png",
                      }}
                      style={styles.inlineCgvLogoImg}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.mutedCinemaAddress}>
                    4th floor, Vincom Ocean Park, Da Ton, Gia Lam, Ha Noi
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
                  Show this QR code to the ticket counter to receive your ticket
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

          {/* PHẦN CHỨA MÃ VẠCH KÉO DÀI CHUẨN FIGMA */}
          <View style={styles.bottomBarcodeArea}>
            <RenderPerfectBarcode />
            <Text style={styles.finalOrderStringText}>
              Oder ID: 78889377726
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
    justifyContent: "center", // Giúp chiếc vé sau khi co ngắn lại sẽ nằm căn giữa màn hình cực đẹp
  },
  fullTicketCard: {
    // Đã loại bỏ flex: 1 để chiếc vé tự động co ngắn lại theo nội dung bên trong
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
  cinemaHeaderInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  boldCinemaName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  inlineCgvLogoImg: {
    width: 28,
    height: 15,
    marginLeft: 4,
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
    paddingBottom: 24, // Hạ hoàn toàn xuống 24 để bo sát chân vé lý tưởng
    alignItems: "center",
    justifyContent: "center",
  },
  barcodeWrapper: {
    flexDirection: "row",
    height: 100, // Giảm từ 105 xuống 70 giúp thanh mã vạch có tỷ lệ thanh thoát, tinh tế hơn
    alignItems: "stretch",
    width: "100%",
    justifyContent: "center",
    marginBottom: 12,
  },
  singleBar: {
    height: "100%",
  },
  finalOrderStringText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.8,
    letterSpacing: 0.5,
  },
});
