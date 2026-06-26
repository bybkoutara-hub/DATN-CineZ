import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { cancelBooking, createBooking } from "../services/bookingService";
import { createVnpayUrl } from "../services/paymentService";

// ==========================================
// HỆ MÀU SẮC CHUẨN FIGMA
// ==========================================
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#151517";
const PRIMARY_YELLOW = "#E2A43B";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#888888";
const BORDER_GRAY = "#242426";

// Deep link app sẽ nhận lại sau khi thanh toán VNPay xong
const VNPAY_RETURN_SCHEME = "mobileapp://vnpay-return";

export default function PaymentScreen() {
  const router = useRouter();

  // Nhận dữ liệu đặt vé từ màn Combo
  const params = useLocalSearchParams();
  const showtimeId = params.showtimeId as string;
  const seats = ((params.seats as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const grandTotal = Number(params.grandTotal || 0);
  const movieTitle = (params.movieTitle as string) || "Vé xem phim";
  const moviePoster = (params.moviePoster as string) || "";
  const roomName = (params.roomName as string) || "Phòng chiếu CineZ";
  const startTime = params.startTime as string;
  const showDateTime = startTime
    ? new Date(startTime).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Đang cập nhật";
  let combos: { name: string; quantity: number; price: number }[] = [];
  try {
    combos = params.combos ? JSON.parse(params.combos as string) : [];
  } catch {
    combos = [];
  }

  // State quản lý phương thức được chọn (Mặc định chọn VNPay)
  const [selectedMethod, setSelectedMethod] = useState("vnpay");
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoErr, setPromoErr] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const finalTotal = Math.max(0, grandTotal - discount);

  // Mã đơn hàng ngẫu nhiên hiển thị cho đẹp (không gửi lên server)
  const orderId = String(showtimeId || "").slice(-8).toUpperCase() || "MB000000";

  // Hai phương thức thanh toán thực tế
  const paymentMethods = [
    {
      id: "vnpay",
      label: "VNPay",
      subtitle: "Thanh toán online qua thẻ/ứng dụng ngân hàng",
      icon: "card-outline" as const,
    },
    {
      id: "cash",
      label: "Tiền mặt tại quầy",
      subtitle: "Giữ vé trước, thanh toán khi đến rạp",
      icon: "cash-outline" as const,
    },
  ];

  // Áp mã giảm giá qua API
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setPromoErr("");
    setPromoMsg("");
    try {
      const res = await api.post("/promotions/apply", { code: promoCode.trim(), orderTotal: grandTotal });
      if (res.data?.success) {
        setDiscount(res.data.data.discount);
        setPromoMsg(`Giảm ${res.data.data.discount.toLocaleString("vi-VN")} đ`);
      } else {
        setPromoErr(res.data?.message || "Mã không hợp lệ");
      }
    } catch (error: any) {
      setPromoErr(error?.response?.data?.message || "Mã không hợp lệ");
    } finally {
      setApplyingPromo(false);
    }
  };

  // Đặt vé tiền mặt: tạo vé hoàn tất ngay rồi sang tab vé
  const handleCashBooking = async () => {
    await createBooking({
      showtimeId,
      seats,
      combos,
      totalPrice: finalTotal,
      paymentMethod: "cash",
    });
    Alert.alert("Đặt vé thành công", "Vé đã được giữ. Vui lòng thanh toán khi đến quầy.");
    router.replace("/(tabs)/ticket");
  };

  // Đặt vé VNPay: tạo vé pending -> lấy URL thanh toán -> mở trình duyệt -> xử lý kết quả
  const handleVnpayBooking = async () => {
    const res = await createBooking({
      showtimeId,
      seats,
      combos,
      totalPrice: finalTotal,
      paymentMethod: "vnpay",
    });
    const bookingId = res?.data?._id;
    if (!bookingId) {
      throw new Error("Không tạo được đơn đặt vé.");
    }

    const paymentUrl = await createVnpayUrl(bookingId);
    const result = await WebBrowser.openAuthSessionAsync(paymentUrl, VNPAY_RETURN_SCHEME);

    if (result.type === "success" && result.url) {
      const { queryParams } = Linking.parse(result.url);
      // status có thể là string hoặc string[] -> chuẩn hóa về string đầu tiên
      const rawStatus = queryParams?.status;
      const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
      if (status === "success") {
        Alert.alert("Thanh toán thành công", "Cảm ơn bạn! Vé đã được xác nhận.");
        router.replace("/(tabs)/ticket");
        return;
      }
      // Thất bại/sai số tiền: backend đã tự hủy & hoàn ghế qua return URL
      Alert.alert(
        "Thanh toán chưa hoàn tất",
        "Giao dịch không thành công hoặc đã bị hủy. Vé sẽ không được giữ.",
      );
    } else {
      // Người dùng đóng trình duyệt giữa chừng -> backend chưa nhận được kết quả.
      // Chủ động hủy đơn pending để hoàn ghế lại cho người khác.
      await cancelBooking(bookingId);
      Alert.alert(
        "Đã hủy thanh toán",
        "Bạn đã đóng cửa sổ thanh toán. Ghế đã được hoàn lại, bạn có thể đặt lại bất cứ lúc nào.",
      );
    }
  };

  // Xử lý nút thanh toán theo phương thức đang chọn
  const handlePayment = async () => {
    if (!showtimeId || seats.length === 0) {
      Alert.alert("Thiếu thông tin", "Không tìm thấy suất chiếu hoặc ghế đã chọn.");
      return;
    }
    setSubmitting(true);
    try {
      if (selectedMethod === "vnpay") {
        await handleVnpayBooking();
      } else {
        await handleCashBooking();
      }
    } catch (error: any) {
      const msg =
        error?.response?.status === 401
          ? "Bạn cần đăng nhập để đặt vé."
          : error?.response?.data?.message || error?.message || "Đặt vé thất bại, vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* ==========================================
          1. THANH TIÊU ĐỀ
          ========================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ==========================================
            2. THẺ THÔNG TIN PHIM
            ========================================== */}
        <View style={styles.cardContainer}>
          <Image
            source={{
              uri: moviePoster || "https://via.placeholder.com/100x150",
            }}
            style={styles.poster}
          />
          <View style={styles.cardTextSection}>
            <Text style={styles.movieTitle} numberOfLines={2}>{movieTitle}</Text>

            <View style={styles.movieDetailRow}>
              <Ionicons name="location-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>{roomName}</Text>
            </View>

            <View style={styles.movieDetailRow}>
              <Ionicons name="time-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>{showDateTime}</Text>
            </View>

            <View style={styles.movieDetailRow}>
              <Ionicons name="pricetag-outline" size={12} color={TEXT_MUTED} />
              <Text style={styles.movieDetailText}>
                {seats.length} ghế • {combos.length} combo
              </Text>
            </View>
          </View>
        </View>

        {/* ==========================================
            3. CHI TIẾT ĐƠN HÀNG
            ========================================== */}
        <View style={styles.orderDetailSection}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Mã đơn</Text>
            <Text style={styles.orderValueBold}>{orderId}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Ghế</Text>
            <Text style={styles.orderValueBold}>
              {seats.length > 0 ? seats.join(", ") : "--"}
            </Text>
          </View>
          {combos.length > 0 && (
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderLabel}>Combo</Text>
              <Text style={styles.orderValueBold}>
                {combos.map((c) => `${c.name} x${c.quantity}`).join(", ")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            4. KHỐI NHẬP MÃ GIẢM GIÁ
            ========================================== */}
        <View style={styles.discountRow}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="ticket-outline"
              size={18}
              color={TEXT_MUTED}
              style={styles.ticketIcon}
            />
            <TextInput
              placeholder="Mã giảm giá"
              placeholderTextColor={TEXT_MUTED}
              style={styles.discountInput}
              autoCorrect={false}
              value={promoCode}
              onChangeText={(t) => { setPromoCode(t); setDiscount(0); setPromoMsg(""); setPromoErr(""); }}
            />
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.8}
            onPress={handleApplyPromo}
            disabled={applyingPromo}
          >
            {applyingPromo ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.applyText}>Áp dụng</Text>
            )}
          </TouchableOpacity>
        </View>
        {promoErr ? <Text style={{ color: "#FF453A", fontSize: 12, marginTop: 4 }}>{promoErr}</Text> : null}
        {promoMsg ? <Text style={{ color: "#34C759", fontSize: 12, marginTop: 4 }}>{promoMsg}</Text> : null}

        <View style={styles.divider} />

        {/* ==========================================
            5. TỔNG TIỀN
            ========================================== */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng đơn hàng</Text>
          <Text style={[styles.totalValue, discount > 0 && { textDecorationLine: 'line-through', fontSize: 16 }]}>
            {grandTotal.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Giảm giá</Text>
            <Text style={[styles.totalValue, { color: "#34C759", fontSize: 16 }]}>
              -{discount.toLocaleString("vi-VN")} đ
            </Text>
          </View>
        )}
        <View style={[styles.totalRow, { marginTop: 8 }]}>
          <Text style={[styles.totalLabel, { fontWeight: "700", fontSize: 16 }]}>Thanh toán</Text>
          <Text style={[styles.totalValue, { fontSize: 22 }]}>
            {finalTotal.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* ==========================================
            6. PHƯƠNG THỨC THANH TOÁN
            ========================================== */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => {
            const isActive = method.id === selectedMethod;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod(method.id)}
                style={[styles.methodItem, isActive && styles.methodItemActive]}
              >
                <View style={styles.logoContainer}>
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={isActive ? PRIMARY_YELLOW : TEXT_MUTED}
                  />
                </View>

                <View style={styles.methodTextGroup}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  {method.subtitle && (
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  )}
                </View>

                <Ionicons
                  name={isActive ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={isActive ? PRIMARY_YELLOW : TEXT_MUTED}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ==========================================
            7. GHI CHÚ THANH TOÁN
            ========================================== */}
        <View style={styles.timerCard}>
          <Ionicons name="information-circle-outline" size={18} color={TEXT_MUTED} />
          <Text style={styles.timerLabel}>
            {selectedMethod === "vnpay"
              ? "Bạn sẽ được chuyển sang cổng VNPay để thanh toán an toàn."
              : "Vé được giữ chỗ, vui lòng thanh toán khi đến quầy."}
          </Text>
        </View>
      </ScrollView>

      {/* ==========================================
          8. NÚT THANH TOÁN CỐ ĐỊNH Ở ĐÁY
          ========================================== */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={handlePayment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.continueText}>
              {selectedMethod === "vnpay"
                ? `Thanh toán ${finalTotal.toLocaleString("vi-VN")} đ`
                : `Đặt vé ${finalTotal.toLocaleString("vi-VN")} đ`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// KIỂU DÁNG STYLESHEET TOÀN DIỆN
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 30,
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 140, // Đệm dưới tránh nút Bottom Action đè chữ
  },

  // Movie Card Section
  cardContainer: {
    flexDirection: "row",
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  poster: {
    width: 95,
    height: 135,
    borderRadius: 12,
  },
  cardTextSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  movieTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  movieDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  movieDetailText: {
    color: TEXT_MUTED,
    fontSize: 13,
  },

  // Order Details Section
  orderDetailSection: {
    gap: 12,
    marginBottom: 16,
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  orderValueBold: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER_GRAY,
    marginVertical: 16,
  },

  // Discount Section
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: SURFACE_DARK,
    paddingHorizontal: 14,
    marginRight: 12,
  },
  ticketIcon: {
    marginRight: 8,
  },
  discountInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 14,
  },
  applyButton: {
    minWidth: 85,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    color: BACKGROUND_BLACK,
    fontSize: 14,
    fontWeight: "700",
  },

  // Total Section
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  totalLabel: {
    color: TEXT_MUTED,
    fontSize: 15,
  },
  totalValue: {
    color: PRIMARY_YELLOW,
    fontSize: 20,
    fontWeight: "800",
  },

  // Payment Methods Section
  sectionTitle: {
    color: TEXT_LIGHT,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
  },
  methodsContainer: {
    gap: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: SURFACE_DARK,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodItemActive: {
    borderColor: PRIMARY_YELLOW,
    backgroundColor: "rgba(226, 164, 59, 0.05)",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#202022",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  methodTextGroup: {
    flex: 1,
  },
  methodLabel: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "600",
  },
  methodSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  // Note Section
  timerCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: SURFACE_DARK,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timerLabel: {
    flex: 1,
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 18,
  },

  // Bottom Fixed Button Action
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: BACKGROUND_BLACK,
  },
  continueButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: BACKGROUND_BLACK,
    fontSize: 16,
    fontWeight: "700",
  },
});
