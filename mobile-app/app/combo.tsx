import { AntDesign, Feather } from "@expo/vector-icons"; // ✅ Đã thêm Feather vào đây để tránh crash
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Đang đồng bộ thư viện chuyên dụng

// Định nghĩa giá tiền cố định của các món ăn
const PRICE_MAP = {
  comboCapDoi: 250000,
  comboDon: 150000,
  nuocSuoi: 50000,
  bapPhoMai: 80000,
};

export default function ComboScreen() {
  const router = useRouter();

  // Tầng State quản lý số lượng bắp nước người dùng chọn chọn
  const [quantities, setQuantities] = useState({
    comboCapDoi: 1, // Mặc định chọn sẵn 1 theo UI cũ của bạn
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

  // Tự động tính toán tổng tiền chính xác khi số lượng thay đổi
  const totalAmount = useMemo(() => {
    return (
      quantities.comboCapDoi * PRICE_MAP.comboCapDoi +
      quantities.comboDon * PRICE_MAP.comboDon +
      quantities.nuocSuoi * PRICE_MAP.nuocSuoi +
      quantities.bapPhoMai * PRICE_MAP.bapPhoMai
    );
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
              uri: "https://m.media-amazon.com/images/M/MV5BMTExZmVjY2ItYTAzYi00MDdlLWFlOWItNTJhMDRjMzQ5ZGY0XkEyXkFqcGdeQXVyODIyOTEyMzY@._V1_.jpg",
            }}
            style={styles.moviePoster}
          />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>Eternals</Text>
            <Text style={styles.movieDetails}>Hôm nay, 19:30 • CGV Vincom</Text>
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>Ghế E5, E6</Text>
            </View>
          </View>
        </View>

        {/* 3. COMBO ĐẶC BIỆT */}
        <Text style={styles.sectionTitle}>Combo Đặc Biệt</Text>

        {/* Card: Combo Cặp Đôi */}
        <View style={styles.itemCardRow}>
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </View>
          <Image
            source={require("../assets/images/cbcapdoi.png")}
            style={styles.itemImageRow}
          />
          <View style={styles.itemDetailsRow}>
            <Text style={styles.itemName}>Combo Cặp Đôi</Text>
            <Text style={styles.itemDesc}>2 bắp lớn + 2 nước lớn</Text>
            <Text style={styles.itemPriceYellow}>
              {PRICE_MAP.comboCapDoi.toLocaleString("vi-VN")} VNĐ
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
              {PRICE_MAP.comboDon.toLocaleString("vi-VN")} VNĐ
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
              <Text style={{ color: "#fff" }}>Ảnh Nước Suối</Text>
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
              <Text style={{ color: "#fff" }}>Ảnh Bắp Phô Mai</Text>
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
          <Text style={styles.footerLabel}>Tổng cộng</Text>
          {/* ✅ Hiển thị tổng tiền thật được tính toán động bằng useMemo */}
          <Text style={styles.footerTotal}>
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            router.push("/payment" as any);
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
