import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
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

export default function VerificationScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState(59);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 chữ số theo chuẩn thiết kế MBooking

  // Refs quản lý tự động nhảy ô (Focus) cho 6 ô nhập
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Bộ đếm ngược thời gian gửi lại mã (bắt đầu từ 00:59)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý khi gõ nhập số số vào ô
  const handleOtpChange = (text: string, index: number) => {
    // Chỉ nhận ký tự số
    const cleanText = text.replace(/[^0-9]/g, "");
    if (!cleanText && text !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo nếu có ký tự nhập vào
    if (cleanText !== "" && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Xử lý khi nhấn nút xóa (Backspace) trên bàn phím
  const handleBackspace = (text: string, index: number) => {
    if (text === "" && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = ""; // Xóa ký tự ô phía trước
      setOtp(newOtp);
      inputRefs[index - 1].current?.focus(); // Lùi con trỏ về trước
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. HEADER - Nút quay lại góc trái */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={26} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* CỤM NỘI DUNG CHÍNH */}
          <View style={styles.mainContent}>
            {/* 2. TIÊU ĐỀ LỚN MÀU VÀNG CHUẨN FIGMA */}
            <Text style={styles.mainTitle}>Confirm OTP code</Text>
            <Text style={styles.subTitle}>
              You just need to enter the OTP sent to the registered{"\n"}phone
              number <Text style={styles.phoneHighlight}>(704) 555-0127.</Text>
            </Text>

            {/* 3. ĐIỀU KHIỂN KHỐI 6 Ô NHẬP OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpBox}>
                  <TextInput
                    ref={inputRefs[index]}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace") {
                        handleBackspace(digit, index);
                      }
                    }}
                    placeholderTextColor="rgba(255, 255, 255, 0.1)"
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {/* 4. ĐỒNG HỒ ĐẾM NGƯỢC (NẰM PHẢI CHUẨN PIXEL) */}
            <View style={styles.timerWrapper}>
              <Text style={styles.timerText}>
                00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            </View>
          </View>

          {/* Đẩy nội dung nút bấm xuống sát đáy ứng dụng trên bàn phím */}
          <View style={{ flex: 1 }} />

          {/* 5. NÚT TIẾP TỤC (CONTINUE MÀU VÀNG ĐỒNG BỘ LUỒNG) */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.continueButton,
                otp.includes("") && styles.continueButtonDisabled,
              ]}
              onPress={() => router.push("/username")} // Khi đã có thư mục (tabs) hãy đổi thành router.push("/(tabs)")
              disabled={otp.includes("")} // Vô hiệu hóa nếu chưa điền đủ 6 số
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// HỆ MÀU CHUẨN THEO ẢNH PHÂN TÍCH FIGMA MBOOKING
const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";
const OTP_BOX_BORDER = "rgba(252, 196, 68, 0.5)"; // Màu vàng mờ tinh tế cho viền ô nhập

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
    paddingTop: Platform.OS === "android" ? 45 : 10,
  },
  header: {
    height: 56,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  mainContent: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  mainTitle: {
    color: PRIMARY_YELLOW, // Tiêu đề bắt buộc màu vàng theo bản vẽ
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  subTitle: {
    color: "rgba(255, 255, 255, 0.7)", // Độ tương phản vừa phải đọc dễ chịu
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 36,
  },
  phoneHighlight: {
    color: "#ffffff",
    fontWeight: "500",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Chia đều khoảng cách 6 ô tràn viền hai bên mượt mà
    alignItems: "center",
    width: "100%",
    marginBottom: 14,
  },
  otpBox: {
    width: 46, // Độ rộng tính toán tối ưu vừa vặn cho layout màn hình 6 ô
    height: 56,
    backgroundColor: "#131009", // Màu tối ánh nâu nhẹ hợp với viền vàng
    borderRadius: 8, // Góc bo nhẹ cá tính đúng chuẩn hình ảnh cung cấp
    borderWidth: 1,
    borderColor: OTP_BOX_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  otpInput: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    height: "100%",
    padding: 0,
  },
  timerWrapper: {
    width: "100%",
    alignItems: "flex-end", // Ép chặt đồng hồ đếm ngược về phía bên phải dưới khối ô nhập
    paddingRight: 2,
  },
  timerText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    marginBottom: Platform.OS === "ios" ? 16 : 24,
  },
  continueButton: {
    backgroundColor: PRIMARY_YELLOW,
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.4, // Làm mờ nút rõ rệt khi chưa nhập đủ mã
  },
  continueText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
