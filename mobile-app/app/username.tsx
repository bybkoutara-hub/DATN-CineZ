import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
import { updateProfileApi } from "../services/authService";

export default function EnterUsernameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialName = (params.name as string) || "";
  const [username, setUsername] = useState(initialName);
  const [saving, setSaving] = useState(false);

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
            {/* 2. TIÊU ĐỀ LỚN MÀU VÀNG LỆCH TRÁI */}
            <Text style={styles.mainTitle}>Nhập tên người dùng</Text>

            {/* 3. DÒNG PHỤ ĐỀ / GHI CHÚ */}
            <Text style={styles.subTitle}>
              Ký tự Latin, không dùng emoji/ký hiệu đặc biệt
            </Text>

            {/* 4. Ô NHẬP USERNAME */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tên của bạn"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                keyboardType="default" // FIX: Đảm bảo mở bàn phím chữ thay vì bị kẹt bàn phím số của trang OTP
                autoCapitalize="words"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                autoFocus={true}
              />
              {/* Đường gạch ngang mảnh chuẩn thiết kế */}
              <View style={styles.inputUnderline} />
            </View>
          </View>

          {/* Đẩy nút bấm bám sát đỉnh bàn phím */}
          <View style={{ flex: 1 }} />

          {/* 5. NÚT HOÀN THÀNH (DONE) */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.doneButton,
                username.trim() === "" && styles.doneButtonDisabled,
              ]}
              onPress={async () => {
                if (saving) return;
                setSaving(true);
                try {
                  if (username.trim() !== initialName) {
                    await updateProfileApi({ name: username.trim() });
                  }
                } catch {}
                setSaving(false);
                router.replace("/(tabs)");
              }}
              disabled={username.trim() === ""}
            >
              <Text style={styles.doneText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY_YELLOW = "#FCC444";
const BACKGROUND_BLACK = "#000000";

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
    color: PRIMARY_YELLOW,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  subTitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginBottom: 48,
  },
  inputSection: {
    width: "100%",
  },
  textInput: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    padding: 0,
    letterSpacing: 0.5,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // UI: Hạ độ sáng xuống một chút giúp thanh line mảnh tinh tế giống Figma hơn
    width: "100%",
    marginTop: 12,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    marginBottom: Platform.OS === "ios" ? 16 : 24,
  },
  doneButton: {
    backgroundColor: PRIMARY_YELLOW,
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonDisabled: {
    opacity: 0.4,
  },
  doneText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
