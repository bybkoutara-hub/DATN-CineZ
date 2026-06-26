import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginApi } from "../services/authService";

// Bảng màu chuẩn hệ thống Dark-Mode Figma
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212"; // Nền của ô nhập liệu (Input)
const PRIMARY_YELLOW = "#FCC434"; // Màu vàng thương hiệu CineZ / MBooking
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const BORDER_COLOR = "#1C1C1F";

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || "");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false); // Thêm state loading

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await loginApi(email, password);
      // Token đã được lưu trong loginApi -> vào thẳng trang chủ
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error?.response?.data?.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={TEXT_LIGHT} />
          </TouchableOpacity>

          <View style={styles.welcomeContainer}>
            <Text style={styles.titleText}>Chào mừng trở lại</Text>
            <Text style={styles.subtitleText}>
              Đăng nhập để viết tiếp câu chuyện đặt vé của bạn
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#444446"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#444446"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={secureText ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={TEXT_MUTED}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.85}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={BACKGROUND_BLACK} />
              ) : (
                <Text style={styles.signInButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>
                Chưa có tài khoản?{" "}
              </Text>
              <Link href={"/signup"} asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Đăng ký</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 12,
  },
  welcomeContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_LIGHT,
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 8,
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: "column",
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_DARK,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 15,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_YELLOW,
  },
  actionContainer: {
    marginTop: "auto",
    paddingTop: 32,
    gap: 20,
  },
  signInButton: {
    backgroundColor: PRIMARY_YELLOW,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_YELLOW,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 6px 12px rgba(252, 196, 52, 0.25)",
      },
    }),
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: BACKGROUND_BLACK,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_YELLOW,
  },
});
