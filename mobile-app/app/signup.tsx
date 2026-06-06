import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Nhớ import API (giả định bạn có hàm registerWithPhone)
// import { registerWithPhone } from "../services/authService";

export default function SignUpScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý đăng ký bằng số điện thoại
  const handleContinue = async () => {
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 8) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      // Bỏ comment dòng dưới để gọi API thực tế
      // await registerWithPhone(phoneNumber);

      // Giả lập delay mạng
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Chuyển sang trang xác thực OTP
      router.push("/verification");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã xác nhận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Sử dụng KeyboardAvoidingView để đẩy giao diện lên mượt mà khi mở bàn phím */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. THANH TIÊU ĐỀ (HEADER chuẩn tỉ lệ Figma, dùng absolute cho nút back để title chính giữa tuyệt đối) */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={26} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign up</Text>
          </View>

          {/* KHỐI NỘI DUNG NHẬP LIỆU PHÍA TRÊN */}
          <View style={styles.topContent}>
            {/* 2. KHU VỰC NHẬP SỐ ĐIỆN THOẠI */}
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <Feather
                  name="phone"
                  size={22}
                  color="rgba(255, 255, 255, 0.6)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="(704) 555-0127"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!loading}
                />
              </View>
              {/* Đường gạch ngang mảnh chuẩn nét mảnh Figma */}
              <View style={styles.inputUnderline} />
            </View>

            {/* 3. NÚT TIẾP TỤC (CONTINUE - Bo tròn mềm mại, độ cao chuẩn UI hiện đại) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={BACKGROUND_BLACK} />
              ) : (
                <Text style={styles.continueText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Khoảng trống co giãn đẩy phần Social và Footer xuống sát đáy tự nhiên */}
          <View style={{ flex: 1 }} />

          {/* KHỐI MẠNG XÃ HỘI & ĐIỀU KHOẢN PHÍA DƯỚI */}
          <View style={styles.bottomContent}>
            {/* 4. ĐƯỜNG PHÂN CÁCH (OR CONTINUE WITH) */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 5. HỆ THỐNG NÚT MẠNG XÃ HỘI (SOCIAL BUTTONS) */}
            <View style={styles.socialContainer}>
              {/* Nút Facebook */}
              <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
                <FontAwesome
                  name="facebook-official"
                  size={24}
                  color="#1877F2"
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              {/* Nút Google */}
              <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
                <FontAwesome
                  name="google"
                  size={22}
                  color="#EA4335"
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* 6. VĂN BẢN ĐIỀU KHOẢN (FOOTER TEXT) */}
            <Text style={styles.footerText}>
              By sign in or sign up, you agree to our Terms of Service{"\n"}and{" "}
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// BẢNG MÀU CHUẨN ĐÚNG PHONG CÁCH DARK MODE MBOOKING
const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";
const INPUT_CONTAINER_BG = "#1C1C1E";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
    paddingTop: Platform.OS === "android" ? 45 : 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    paddingHorizontal: 24,
    position: "relative",
    marginBottom: 32,
  },
  backButton: {
    position: "absolute",
    left: 24,
    padding: 4,
    zIndex: 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  topContent: {
    paddingHorizontal: 24,
  },
  inputSection: {
    width: "100%",
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "500",
    padding: 0,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
    marginTop: 6,
  },
  continueButton: {
    backgroundColor: PRIMARY_YELLOW,
    width: "100%",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 16,
  },
  socialContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 32,
  },
  socialButton: {
    backgroundColor: INPUT_CONTAINER_BG,
    width: "100%",
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  socialIcon: {
    position: "absolute",
    left: 28,
  },
  socialText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Platform.OS === "ios" ? 10 : 20,
  },
  footerLinkText: {
    color: PRIMARY_YELLOW,
    fontWeight: "500",
  },
});
