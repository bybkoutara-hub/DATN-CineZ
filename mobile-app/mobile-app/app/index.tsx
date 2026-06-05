import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const slideAnim = useRef(new Animated.Value(400)).current; // Tăng khoảng cách giấu ban đầu của sheet

  const openLangModal = () => {
    setLangModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeLangModal = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setLangModalVisible(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. THANH HEADER (LOGO & NGÔN NGỮ) */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextBold}>MB</Text>
          <View style={styles.logoDot} />
          <Text style={styles.logoTextBold}>oking</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.langButton}
          onPress={openLangModal}
        >
          <Text style={styles.langText}>🌐 {selectedLanguage}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. KHU VỰC TRUNG TÂM: BANNER POSTER PHIM (Tối ưu chiếm không gian lớn nhất) */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/infinity_war.png")}
            style={styles.posterImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 3. KHU VỰC ĐÁY (TEXT, INDICATORS, BUTTONS, FOOTER) */}
      <View style={styles.bottomSection}>
        {/* PHẦN CHỮ GIỚI THIỆU */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>MBooking hello!</Text>
          <Text style={styles.subtitleText}>Enjoy your favorite movies</Text>
        </View>

        {/* CHẤM TRÒN CHUYỂN TRANG */}
        <View style={styles.indicatorContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* HỆ THỐNG NÚT BẤM */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity activeOpacity={0.85} style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.signUpButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* ĐIỀU KHOẢN SỬ DỤNG */}
        <Text style={styles.footerText}>
          By sign in or sign up, you agree to our Terms of Service{"\n"}and
          Privacy Policy
        </Text>
      </View>

      {/* BOTTOM SHEET CHỌN NGÔN NGỮ */}
      <Modal
        transparent
        visible={langModalVisible}
        animationType="none"
        onRequestClose={closeLangModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeLangModal}>
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Choose language</Text>
            <Text style={styles.sheetSubtitle}>
              Which language do you want to use?
            </Text>

            {/* Lựa chọn 1: English */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.langOptionRow}
              onPress={() => setSelectedLanguage("English")}
            >
              <Text
                style={[
                  styles.langOptionText,
                  selectedLanguage === "English" && styles.activeLangText,
                ]}
              >
                English
              </Text>
              <View
                style={[
                  styles.radioCircle,
                  selectedLanguage === "English" && styles.radioCircleActive,
                ]}
              >
                {selectedLanguage === "English" && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Lựa chọn 2: Vietnamese */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.langOptionRow}
              onPress={() => setSelectedLanguage("Vietnamese")}
            >
              <Text
                style={[
                  styles.langOptionText,
                  selectedLanguage === "Vietnamese" && styles.activeLangText,
                ]}
              >
                Vietnamese
              </Text>
              <View
                style={[
                  styles.radioCircle,
                  selectedLanguage === "Vietnamese" && styles.radioCircleActive,
                ]}
              >
                {selectedLanguage === "Vietnamese" && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.confirmLangButton}
              onPress={closeLangModal}
            >
              <Text style={styles.confirmLangButtonText}>
                Use {selectedLanguage}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";
const SHEET_GREY = "#1C1C1E";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
    paddingTop: Platform.OS === "android" ? 45 : 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    height: 50,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextBold: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_YELLOW,
    marginHorizontal: 3,
    alignSelf: "center",
    marginTop: 6,
  },
  langButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  langText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Khối ảnh co giãn linh hoạt chiếm trọn vùng giữa màn hình giống Figma
  imageSection: {
    flex: 55,
    justifyContent: "center",
    paddingHorizontal: 24,
    marginVertical: 10,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    maxHeight: 400, // Khống chế chiều cao tối đa không để bị lố trên màn hình dài
    borderRadius: 24,
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  // Khối chứa các thành phần tương tác ở dưới đáy
  bottomSection: {
    flex: 45,
    paddingHorizontal: 24,
    justifyContent: "flex-end", // Đẩy tất cả sát xuống đáy tự nhiên
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: PRIMARY_YELLOW,
    width: 20, // Kéo dài chấm tròn đang active chuẩn hiệu ứng Carousel của Figma
  },
  buttonContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: PRIMARY_YELLOW,
    width: "100%",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
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

  // STYLES BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: SHEET_GREY,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    paddingTop: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  sheetSubtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    marginBottom: 16,
  },
  langOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  langOptionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  activeLangText: {
    color: PRIMARY_YELLOW,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleActive: {
    borderColor: PRIMARY_YELLOW,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_YELLOW,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    width: "100%",
  },
  confirmLangButton: {
    backgroundColor: PRIMARY_YELLOW,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  confirmLangButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
