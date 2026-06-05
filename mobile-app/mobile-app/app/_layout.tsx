import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Nhóm các tab chính (Bao gồm Homepage) */}
      <Stack.Screen name="(tabs)" />

      {/* 2. Trang chi tiết phim xếp chồng lên trên */}
      <Stack.Screen
        name="movie-detail"
        options={{
          animation: "slide_from_right", // Hiệu ứng lướt từ phải sang chuẩn Figma
        }}
      />
    </Stack>
  );
}
