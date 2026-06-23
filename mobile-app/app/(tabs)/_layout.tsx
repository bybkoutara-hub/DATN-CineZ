import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Màu sắc chữ và icon khi được chọn và không được chọn
        tabBarActiveTintColor: "#FCC434", // Màu vàng chuẩn Figma
        tabBarInactiveTintColor: "#A3A3A3", // Màu xám nhạt unselected

        // Kiểu dáng Label chữ bên dưới icon
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },

        // Cấu hình chiều cao và nền đen tuyệt đối cho thanh Nav
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 1,
          borderTopColor: "#1C1C1E", // Đường kẻ mờ phía trên nav
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      {/* 1. TAB HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            // Custom icon ngôi nhà có vạch kẻ giữa chuẩn hình ảnh
            <MaterialCommunityIcons
              name={focused ? "home-variant" : "home-variant-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 2. TAB TICKET */}
      <Tabs.Screen
        name="ticket"
        options={{
          title: "Ticket",
          tabBarIcon: ({ color, focused }) => (
            // Icon vé xem phim có 3 chấm dọc phân ranh giới giữa vé
            <MaterialCommunityIcons
              name={
                focused ? "ticket-confirmation" : "ticket-confirmation-outline"
              }
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. TAB MOVIE */}
      <Tabs.Screen
        name="movie"
        options={{
          title: "Movie",
          tabBarIcon: ({ color, focused }) => (
            // Sử dụng hoàn toàn MaterialCommunityIcons để tránh lỗi style và đồng bộ kích thước
            <MaterialCommunityIcons
              name={focused ? "video" : "video-outline"}
              size={focused ? 26 : 25} // Tăng nhẹ 1px khi focus để tạo hiệu ứng nhấn giống Figma
              color={color}
              style={{ marginBottom: -2 }} // Căn chỉnh trực tiếp inline an toàn tuyệt đối
            />
          ),
        }}
      />

      {/* 4. TAB PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              // Trạng thái bật: Icon user dạng đổ khối đặc màu vàng
              <MaterialCommunityIcons name="account" size={26} color={color} />
            ) : (
              // Trạng thái tắt: Dạng nét mảnh thanh lịch của Feather đúng hình chụp
              <Feather name="user" size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
