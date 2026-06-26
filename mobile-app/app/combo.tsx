import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCombos } from "../services/comboService";

const FALLBACK_PRICE_MAP: Record<string, number> = {
  comboCapDoi: 250000,
  comboDon: 150000,
  nuocSuoi: 50000,
  bapPhoMai: 80000,
};

const COMBO_KEYS = ["comboCapDoi", "comboDon", "nuocSuoi", "bapPhoMai"] as const;
type ComboKey = (typeof COMBO_KEYS)[number];

const FALLBACK_COMBO_META: Record<ComboKey, { name: string; price: number }> = {
  comboCapDoi: { name: "Combo Cặp Đôi", price: 250000 },
  comboDon: { name: "Combo Đơn", price: 150000 },
  nuocSuoi: { name: "Nước Suối", price: 50000 },
  bapPhoMai: { name: "Bắp Phô Mai", price: 80000 },
};

export default function ComboScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const showtimeId = params.showtimeId as string;
  const seats = ((params.seats as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ticketTotal = Number(params.totalPrice || 0);
  const movieTitle = (params.movieTitle as string) || "Vé xem phim";
  const moviePoster = (params.moviePoster as string) || "";
  const roomName = (params.roomName as string) || "";
  const startTime = params.startTime as string;

  const [comboData, setComboData] = useState<any[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      setLoadingCombos(true);
      const data = await getCombos();
      if (data && data.length > 0) setComboData(data);
      setLoadingCombos(false);
    };
    fetchCombos();
  }, []);

  const PRICE_MAP: Record<string, number> = useMemo(() => {
    if (comboData.length === 0) return FALLBACK_PRICE_MAP;
    const map: Record<string, number> = {};
    comboData.forEach((c: any) => {
      const key = c.key || c._id;
      map[key] = c.price || 0;
    });
    return { ...FALLBACK_PRICE_MAP, ...map };
  }, [comboData]);

  const COMBO_META: Record<ComboKey, { name: string; price: number }> = useMemo(() => {
    if (comboData.length === 0) return FALLBACK_COMBO_META;
    const map: Record<string, { name: string; price: number }> = {};
    comboData.forEach((c: any) => {
      const key = c.key || c._id;
      map[key] = { name: c.name || key, price: c.price || 0 };
    });
    const merged: any = { ...FALLBACK_COMBO_META };
    Object.keys(map).forEach((k) => {
      const existing = merged[k];
      if (existing) merged[k] = map[k];
    });
    return merged as Record<ComboKey, { name: string; price: number }>;
  }, [comboData]);

  const [quantities, setQuantities] = useState<Record<ComboKey, number>>({
    comboCapDoi: 0,
    comboDon: 0,
    nuocSuoi: 0,
    bapPhoMai: 0,
  });

  // Hàm xử lý tăng giảm số lượng đơn giản, tái sử dụng được cho tất cả các món
  const updateQuantity = (
    key: keyof typeof quantities,
    type: "plus" | "minus",
  ) => {
    setQuantities((prev) => {
      const current = prev[key];
      if (type === "minus" && current === 0) return prev;
      return {
        ...prev,
        [key]: type === "plus" ? current + 1 : current - 1,
      };
    });
  };

  // Tổng tiền combo (bắp nước) tính động
  const comboAmount = useMemo(() => {
    return (
      quantities.comboCapDoi * PRICE_MAP.comboCapDoi +
      quantities.comboDon * PRICE_MAP.comboDon +
      quantities.nuocSuoi * PRICE_MAP.nuocSuoi +
      quantities.bapPhoMai * PRICE_MAP.bapPhoMai
    );
  }, [quantities]);

  // Tổng thanh toán cuối = tiền vé (ghế) + tiền combo
  const grandTotal = ticketTotal + comboAmount;

  // Danh sách combo đã chọn (để gửi sang bước thanh toán & lưu booking)
  const selectedCombos = useMemo(() => {
    return (Object.keys(quantities) as (keyof typeof quantities)[])
      .filter((key) => quantities[key] > 0)
      .map((key) => ({
        name: COMBO_META[key].name,
        quantity: quantities[key],
        price: COMBO_META[key].price,
      }));
  }, [quantities]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AntDesign name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Bắp & Nước</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. THÔNG TIN PHIM */}
        <View style={styles.movieCard}>
          <Image
            source={{
              uri: moviePoster || "https://via.placeholder.com/100x150",
            }}
            style={styles.moviePoster}
          />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>{movieTitle}</Text>
            <Text style={styles.movieDetails}>
              {seats.length} ghế • {ticketTotal.toLocaleString("vi-VN")} đ
            </Text>
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>
                Ghế {seats.length > 0 ? seats.join(", ") : "chưa chọn"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. COMBO ĐẶC BIỆT */}
        <Text style={styles.sectionTitle}>Combo Đặc Biệt</Text>

        {/* Card: Combo Cặp Đôi */}
        <View style={styles.itemCardRow}>
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerText}>Bán chạy</Text>
          </View>
          <Image
            source={require("../assets/images/cbcapdoi.png")}
            style={styles.itemImageRow}
          />
          <View style={styles.itemDetailsRow}>
            <Text style={styles.itemName}>Combo Cặp Đôi</Text>
            <Text style={styles.itemDesc}>2 bắp lớn + 2 nước lớn</Text>
            <Text style={styles.itemPriceYellow}>
              {PRICE_MAP.comboCapDoi.toLocaleString("vi-VN")} đ
            </Text>
          </View>

          {/* Bộ đếm (Stepper) động */}
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => updateQuantity("comboCapDoi", "minus")}
            >
              <AntDesign name="minus" size={16} color="#A3A3A3" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantities.comboCapDoi}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, styles.stepperBtnActive]}
              onPress={() => updateQuantity("comboCapDoi", "plus")}
            >
              <AntDesign name="plus" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card: Combo Đơn */}
        <View style={styles.itemCardRow}>
          <Image
            source={require("../assets/images/popcorn-single.png")}
            style={styles.itemImageRow}
          />
          <View style={styles.itemDetailsRow}>
            <Text style={styles.itemName}>Combo Đơn</Text>
            <Text style={styles.itemDesc}>1 bắp vừa + 1 nước lớn</Text>
            <Text style={styles.itemPriceWhite}>
              {PRICE_MAP.comboDon.toLocaleString("vi-VN")} đ
            </Text>
          </View>

          {/* Nếu số lượng = 0 thì hiện nút Thêm, nếu > 0 hiện Bộ đếm giống thiết kế chuyên nghiệp */}
          {quantities.comboDon === 0 ? (
            <TouchableOpacity
              style={styles.addBtnOutline}
              onPress={() => updateQuantity("comboDon", "plus")}
            >
              <AntDesign name="plus" size={18} color="#A3A3A3" />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => updateQuantity("comboDon", "minus")}
              >
                <AntDesign name="minus" size={16} color="#A3A3A3" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantities.comboDon}</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, styles.stepperBtnActive]}
                onPress={() => updateQuantity("comboDon", "plus")}
              >
                <AntDesign name="plus" size={16} color="black" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. MÓN LẺ */}
        <Text style={styles.sectionTitle}>Món Lẻ</Text>
        <View style={styles.gridContainer}>
          {/* Item 1: Nước Suối */}
          <View style={styles.gridCard}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="bottle-soda-classic-outline"
                size={48}
                color="#FCC434"
              />
            </View>
            <Text style={styles.itemNameGrid}>Nước Suối</Text>
            <View style={styles.gridBottomRow}>
              <Text style={styles.itemPriceYellowGrid}>
                {PRICE_MAP.nuocSuoi.toLocaleString("vi-VN")} đ
              </Text>

              {quantities.nuocSuoi === 0 ? (
                <TouchableOpacity
                  style={styles.addBtnOutlineSmall}
                  onPress={() => updateQuantity("nuocSuoi", "plus")}
                >
                  <AntDesign name="plus" size={16} color="#A3A3A3" />
                </TouchableOpacity>
              ) : (
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity("nuocSuoi", "minus")}
                  >
                    <AntDesign name="minus" size={12} color="#A3A3A3" />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.stepperValue,
                      { marginHorizontal: 6, fontSize: 12 },
                    ]}
                  >
                    {quantities.nuocSuoi}
                  </Text>
                  <TouchableOpacity
                    style={[styles.stepperBtn, styles.stepperBtnActive]}
                    onPress={() => updateQuantity("nuocSuoi", "plus")}
                  >
                    <AntDesign name="plus" size={12} color="black" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Item 2: Bắp Phô Mai */}
          <View style={styles.gridCard}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="popcorn" size={48} color="#FCC434" />
            </View>
            <Text style={styles.itemNameGrid}>Bắp Phô Mai</Text>
            <View style={styles.gridBottomRow}>
              <Text style={styles.itemPriceYellowGrid}>
                {PRICE_MAP.bapPhoMai.toLocaleString("vi-VN")} đ
              </Text>

              {quantities.bapPhoMai === 0 ? (
                <TouchableOpacity
                  style={styles.addBtnOutlineSmall}
                  onPress={() => updateQuantity("bapPhoMai", "plus")}
                >
                  <AntDesign name="plus" size={16} color="#A3A3A3" />
                </TouchableOpacity>
              ) : (
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity("bapPhoMai", "minus")}
                  >
                    <AntDesign name="minus" size={12} color="#A3A3A3" />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.stepperValue,
                      { marginHorizontal: 6, fontSize: 12 },
                    ]}
                  >
                    {quantities.bapPhoMai}
                  </Text>
                  <TouchableOpacity
                    style={[styles.stepperBtn, styles.stepperBtnActive]}
                    onPress={() => updateQuantity("bapPhoMai", "plus")}
                  >
                    <AntDesign name="plus" size={12} color="black" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 5. FOOTER THANH TOÁN */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng cộng (vé + combo)</Text>
          {/* ✅ Tổng = tiền vé (ghế) + tiền combo */}
          <Text style={styles.footerTotal}>
            {grandTotal.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            // Truyền toàn bộ dữ liệu đặt vé sang màn thanh toán
            router.push({
              pathname: "/payment",
              params: {
                showtimeId,
                seats: seats.join(","),
                ticketTotal: String(ticketTotal),
                comboTotal: String(comboAmount),
                grandTotal: String(grandTotal),
                combos: JSON.stringify(selectedCombos),
                movieTitle,
                moviePoster,
                roomName,
                startTime: startTime || "",
              },
            });
          }}
        >
          <Text style={styles.checkoutBtnText}>THANH TOÁN</Text>
          <Feather name="arrow-right" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  moviePoster: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  movieInfo: {
    marginLeft: 12,
    justifyContent: "center",
    flex: 1,
  },
  movieTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  movieDetails: {
    color: "#A3A3A3",
    fontSize: 13,
    marginBottom: 8,
  },
  seatBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seatText: {
    color: "#D1D1D1",
    fontSize: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  itemCardRow: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  bestSellerBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FCC434",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  bestSellerText: {
    color: "black",
    fontSize: 10,
    fontWeight: "bold",
  },
  itemImageRow: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  itemDetailsRow: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDesc: {
    color: "#A3A3A3",
    fontSize: 12,
    marginBottom: 8,
  },
  itemPriceYellow: {
    color: "#FCC434",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemPriceWhite: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    padding: 4,
    borderRadius: 12,
  },
  stepperBtnActive: {
    backgroundColor: "#FCC434",
  },
  stepperValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  addBtnOutline: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#2A2A2C",
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemNameGrid: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  gridBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPriceYellowGrid: {
    color: "#FCC434",
    fontSize: 13,
    fontWeight: "bold",
  },
  addBtnOutlineSmall: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  footerLabel: {
    color: "#A3A3A3",
    fontSize: 13,
    marginBottom: 4,
  },
  footerTotal: {
    color: "#FCC434",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutBtn: {
    backgroundColor: "#FCC434",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 8,
  },
});
