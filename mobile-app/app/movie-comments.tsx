import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchMovieComments, sendComment, deleteCommentService } from "../services/commentService";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmModal";


const PRIMARY_YELLOW = "#E2A43B";
const BACKGROUND_BLACK = "#000000";
const SURFACE_DARK = "#1A1A1A";
const TEXT_MUTED = "#999999";

export default function MovieCommentsScreen() {
  const router = useRouter();
  const { movieId, movieTitle } = useLocalSearchParams();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToken, setUserToken] = useState("");

  const confirmDelete = async (commentId: string) => {
    const ok = await confirm({
      title: "Xóa bình luận",
      message: "Bạn chắc chắn muốn xóa?",
      confirmText: "Xóa",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCommentService(commentId, userToken);
      setComments((prevComments: any[]) => prevComments.filter((c) => c._id !== commentId));
      toast.success("Đã xóa bình luận!");
    } catch (error: any) {
      toast.error("Không thể xóa bình luận");
    }
  };

 // 1. Khai báo useRef ở trên đầu Component
const isMounted = React.useRef(true);

// 2. Cập nhật cờ khi component mount/unmount
useEffect(() => {
  isMounted.current = true;
  return () => {
    isMounted.current = false; // Khi thoát trang, cờ sẽ tắt ngay lập tức
  };
}, []);

// 3. Sử dụng cờ này TRƯỚC MỌI lệnh set...
useEffect(() => {
const initData = async () => {
  try {
    // Lấy token ngay tại đây
    const token = await AsyncStorage.getItem("userToken");

    const data = await fetchMovieComments(movieId as string);

    // Chỉ cập nhật khi component vẫn đang chạy (isMounted)
    if (isMounted.current) {
      if (token) setUserToken(token); // Cập nhật token tại đây
      if (data && data.success) setComments(data.comments);
      setLoading(false);
    }
  } catch (error) {
    if (isMounted.current) {
      console.error("Lỗi lấy bình luận:", error);
      setLoading(false);
    }
  }
};

  initData();
}, [movieId]);

  // Hàm xử lý gửi bình luận
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await sendComment(movieId as string, newComment, userToken);
      setNewComment(""); // Xóa trắng ô nhập
      
      // Load lại danh sách
      const data = await fetchMovieComments(movieId as string);
      if (data && data.success) setComments(data.comments);
    } catch (error) {
      console.error("Lỗi gửi bình luận", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

// Trong useEffect, sau khi lấy được token, hãy giải mã nó hoặc lưu ID vào state
// Giả sử bạn giải mã token thành object user:

  // Trong hàm renderComment của file movie-comments.tsx
    const renderComment = ({ item }: { item: any }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentContent}>
      <Text style={styles.userName}>{item.userId?.fullName}</Text>
      <Text style={styles.commentText}>{item.content}</Text>
      
      {/* Nút xóa hiện ra nếu đúng là chủ nhân */}
      {item.userId?._id === currentUserId && ( 
        <TouchableOpacity onPress={() => confirmDelete(item._id)}>
          <Text style={{ color: '#FF4D4D', fontSize: 12, marginTop: 5 }}>Xóa bình luận</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Bình luận</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{movieTitle || "Đang tải..."}</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      {/* 2. DANH SÁCH BÌNH LUẬN */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_YELLOW} />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
          }
        />
      )}

      {/* 3. KHUNG NHẬP BÌNH LUẬN (Luôn nổi trên bàn phím) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.inputArea}>
          {userToken ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Viết cảm nghĩ của bạn..."
                placeholderTextColor={TEXT_MUTED}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !newComment.trim() && { opacity: 0.5 }]} 
                onPress={handleSendComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={BACKGROUND_BLACK} />
                ) : (
                  <Ionicons name="send" size={18} color={BACKGROUND_BLACK} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.loginPrompt} onPress={() => router.push("/sign-in")}>
              <Text style={styles.loginPromptText}>Bạn cần <Text style={{ color: PRIMARY_YELLOW, fontWeight: 'bold' }}>Đăng nhập</Text> để bình luận</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_BLACK },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#222" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: PRIMARY_YELLOW, fontSize: 12, marginTop: 2 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 20 },
  emptyText: { color: TEXT_MUTED, textAlign: "center", marginTop: 40, fontStyle: "italic" },
  commentItem: { flexDirection: "row", marginBottom: 20 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#333", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { color: PRIMARY_YELLOW, fontWeight: "bold", fontSize: 16 },
  commentContent: { flex: 1, backgroundColor: SURFACE_DARK, padding: 12, borderRadius: 12 },
  userName: { color: "#FFF", fontWeight: "bold", marginBottom: 4, fontSize: 14 },
  commentText: { color: "#CCC", fontSize: 14, lineHeight: 20 },
  inputArea: { padding: 16, backgroundColor: "#111", borderTopWidth: 1, borderTopColor: "#222" },
  inputRow: { flexDirection: "row", alignItems: "flex-end" },
  textInput: { flex: 1, backgroundColor: SURFACE_DARK, color: "#FFF", borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, minHeight: 44 },
  sendBtn: { width: 44, height: 44, backgroundColor: PRIMARY_YELLOW, borderRadius: 22, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  loginPrompt: { backgroundColor: SURFACE_DARK, padding: 14, borderRadius: 12, alignItems: "center" },
  loginPromptText: { color: TEXT_MUTED, fontSize: 14 },
});