import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ToastProvider } from "../components/Toast";
import { ConfirmProvider } from "../components/ConfirmModal";
import { isLoggedIn } from "../services/authService";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Chặn khách (chưa đăng nhập) vào các tab: luôn đưa về trang chào (welcome)
  useEffect(() => {
    if (!navigationState?.key) return;
    if (segments[0] !== "(tabs)") return;
    let active = true;
    (async () => {
      const authed = await isLoggedIn();
      if (active && !authed) {
        router.replace("/");
      }
    })();
    return () => {
      active = false;
    };
  }, [navigationState?.key, segments, router]);

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
