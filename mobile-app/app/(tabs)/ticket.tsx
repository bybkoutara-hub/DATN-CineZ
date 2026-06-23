import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Định nghĩa kiểu dữ liệu cho danh sách vé
interface TicketItem {
  id: string;
  title: string;
  time: string;
  date: string;
  cinema: string;
  poster: string;
}

// Dữ liệu mock chuẩn theo hình ảnh Figma của bạn
const TICKET_DATA: TicketItem[] = [
  {
    id: "1",
    title: "Avengers: Infinity War",
    time: "14h15'",
    date: "16.12.2022",
    cinema: "Vincom Ocean Park CGV",
    poster: "../../assets/images/AvengersInfinity War.png",
  },
  {
    id: "2",
    title: "Batman v Superman: Dawn of Justice",
    time: "2h15m",
    date: "22.12.2022",
    cinema: "Vincom Ocean Park CGV",
    poster: "../../assets/images/batman.png",
  },
  {
    id: "3",
    title: "Guardians Of The Galaxy",
    time: "14h15'",
    date: "29.12.2022",
    cinema: "Vincom Ocean Park CGV",
    poster: "../../assets/images/guardians.png",
  },
];

export default function TicketListScreen() {
  const router = useRouter();

  const renderTicketItem = ({ item }: { item: TicketItem }) => {
    return (
      <TouchableOpacity
        style={styles.ticketCard}
        activeOpacity={0.85}
        onPress={() => {
          // Điều hướng sang trang chi tiết vé (MyTicketScreen) của bạn
          router.push("/my-ticket");
        }}
      >
        {/* Poster Phim */}
        <Image
          source={{ uri: item.poster }}
          style={styles.posterImage}
          resizeMode="cover"
        />

        {/* Nội dung thông tin vé bên phải */}
        <View style={styles.ticketDetails}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Hàng chứa Thời gian & Ngày tháng */}
          <View style={styles.metaRow}>
            <Feather name="clock" size={15} color="#A3A3A3" />
            <Text style={styles.metaText}>
              {item.time} • {item.date}
            </Text>
          </View>

          {/* Hàng chứa Tên rạp chiếu */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#A3A3A3" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.cinema}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My ticket</Text>
      </View>

      {/* DANH SÁCH VÉ VỚI FLATLIST */}
      <FlatList
        data={TICKET_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderTicketItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Màu nền đen tuyền đồng bộ toàn hệ thống ứng dụng CineZ
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16, // Tạo khoảng cách đều 16px giữa các item theo layout Figma
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E", // Màu xám nốt tối (Dark Card Background) chuẩn tỉ lệ tương phản
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
  },
  posterImage: {
    width: 95,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  ticketDetails: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    gap: 10, // Giữ khoảng cách thoáng giữa các dòng text
  },
  movieTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#D1D1D6", // Tông xám sáng giúp người dùng đọc tốt trên nền tối
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },
});
