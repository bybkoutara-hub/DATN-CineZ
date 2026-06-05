import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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

// Bảng màu chuẩn hệ thống Dark-Mode Figma
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212"; // Nền của ô nhập liệu (Input)
const PRIMARY_YELLOW = "#FCC434"; // Màu vàng thương hiệu CineZ / MBooking
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const BORDER_COLOR = "#1C1C1F";

export default function SignInScreen() {
  const router = useRouter();

  // State quản lý dữ liệu nhập vào
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  // Xử lý sự kiện đăng nhập
  const handleSignIn = () => {
    console.log("Đăng nhập với:", email, password);
    router.replace("/(tabs)");
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nút Back quay lại */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color={TEXT_LIGHT} />
          </TouchableOpacity>

          {/* Vùng Tiêu đề Chào mừng */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.titleText}>Welcome back</Text>
            <Text style={styles.subtitleText}>
              Sign in to write your own booking story
            </Text>
          </View>

          {/* Form Nhập liệu */}
          <View style={styles.formContainer}>
            {/* Ô nhập Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#444446"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Ô nhập Mật khẩu */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#444446"
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  autoCorrect={false}
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

            {/* Quên mật khẩu */}
            <TouchableOpacity
              onPress={() => console.log("Forgot password pressed")}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Nút Đăng nhập & Đăng ký */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.85}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Điều hướng sang Sign Up */}
            <View style={styles.signUpRow}>
              {/* Fix lỗi rò rỉ ký tự nháy đơn bằng cách dùng &apos; */}
              <Text style={styles.signUpText}>
                Don&apos;t have an account?{" "}
              </Text>
              {/* Ép kiểu tạm thời as any để vượt qua bộ lọc Router định tuyến tĩnh nếu file sign-up chưa sẵn sàng */}
              <Link href={"/sign-up" as any} asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
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
