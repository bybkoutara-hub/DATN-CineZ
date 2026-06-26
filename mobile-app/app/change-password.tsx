import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { changePasswordApi } from "../services/authService";

const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#1C1C1E";
const PRIMARY_YELLOW = "#FCC444";
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#9A9A9A";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }
    setSaving(true);
    try {
      const res = await changePasswordApi(currentPassword, newPassword);
      if (res?.success) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công!");
        router.back();
      } else {
        Alert.alert("Lỗi", res?.message || "Đổi mật khẩu thất bại");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Mật khẩu hiện tại không đúng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.saveText}>Lưu mật khẩu</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_BLACK },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 56 },
  backButton: { width: 40, justifyContent: "center" },
  headerTitle: { color: TEXT_LIGHT, fontSize: 18, fontWeight: "700", textAlign: "center" },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  inputGroup: { marginBottom: 20 },
  label: { color: TEXT_MUTED, fontSize: 13, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  input: {
    backgroundColor: SURFACE_DARK, borderRadius: 12, paddingHorizontal: 16, height: 52,
    color: TEXT_LIGHT, fontSize: 15, borderWidth: 1, borderColor: "#2C2C2E",
  },
  saveButton: {
    backgroundColor: PRIMARY_YELLOW, borderRadius: 30, height: 56, alignItems: "center",
    justifyContent: "center", marginTop: 12,
  },
  saveText: { fontSize: 16, fontWeight: "800", color: BACKGROUND_BLACK },
});
