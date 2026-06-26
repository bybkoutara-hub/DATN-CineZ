import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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
import { registerApi } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#121212";
const PRIMARY_YELLOW = "#FCC434";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const BORDER_COLOR = "#1C1C1F";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi(email, password, name, phone);
      if (res?.token) {
        const isWeb = typeof window !== "undefined" && window.localStorage;
        if (isWeb) {
          window.localStorage.setItem("userToken", res.token);
          window.localStorage.setItem("userInfo", JSON.stringify(res.data || {}));
        } else {
          await AsyncStorage.setItem("userToken", res.token);
          await AsyncStorage.setItem("userInfo", JSON.stringify(res.data || {}));
        }
        router.replace({
          pathname: "/verification",
          params: { phone: phone || "", name: name || "" },
        });
      } else {
        Alert.alert("Đăng ký thất bại", res?.message || "Vui lòng thử lại");
      }
    } catch (error: any) {
      Alert.alert(
        "Đăng ký thất bại",
        error?.response?.data?.message || "Email có thể đã được sử dụng",
      );
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={TEXT_LIGHT} />
          </TouchableOpacity>

          <View style={styles.welcomeContainer}>
            <Text style={styles.titleText}>Tạo tài khoản</Text>
            <Text style={styles.subtitleText}>
              Đăng ký để bắt đầu đặt vé xem phim
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập họ tên của bạn"
                  placeholderTextColor="#444446"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập email"
                  placeholderTextColor="#444446"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#444446"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#444446"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                  <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color={TEXT_MUTED} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={BACKGROUND_BLACK} />
              ) : (
                <Text style={styles.signInButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Đã có tài khoản? </Text>
              <Link href={"/sign-in"} asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Đăng nhập</Text>
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
  container: { flex: 1, backgroundColor: BACKGROUND_BLACK },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start", marginTop: 12 },
  welcomeContainer: { marginTop: 24, marginBottom: 32 },
  titleText: { fontSize: 28, fontWeight: "800", color: TEXT_LIGHT, letterSpacing: 0.3 },
  subtitleText: { fontSize: 14, color: TEXT_MUTED, marginTop: 8, lineHeight: 20 },
  formContainer: { gap: 18, marginBottom: 24 },
  inputGroup: { flexDirection: "column", gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: SURFACE_DARK,
    borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 16, paddingHorizontal: 16, height: 56,
  },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: TEXT_LIGHT, fontSize: 15, height: "100%" },
  eyeIcon: { padding: 4 },
  actionContainer: { marginTop: "auto", paddingTop: 24, gap: 20 },
  signInButton: {
    backgroundColor: PRIMARY_YELLOW, borderRadius: 30, height: 56, alignItems: "center", justifyContent: "center",
  },
  signInButtonText: { fontSize: 16, fontWeight: "800", color: BACKGROUND_BLACK },
  signUpRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signUpText: { fontSize: 14, color: TEXT_MUTED },
  signUpLink: { fontSize: 14, fontWeight: "700", color: PRIMARY_YELLOW },
});
