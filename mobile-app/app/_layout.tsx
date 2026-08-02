import { Stack } from "expo-router";
import { ToastProvider } from "../components/Toast";
import { ConfirmProvider } from "../components/ConfirmModal";

export default function RootLayout() {
  return (
    <ToastProvider>
      <ConfirmProvider>
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

          {/* 3. Trang chọn ghế */}
          <Stack.Screen
            name="select-seat"
            options={{
              animation: "slide_from_right",
            }}
          />

          {/* 4. Trang thanh toán */}
          <Stack.Screen
            name="payment"
            options={{
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </ConfirmProvider>
    </ToastProvider>
  );
}
