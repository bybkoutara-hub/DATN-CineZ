import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Nhóm các tab chính */}
      <Stack.Screen name="(tabs)" />

      {/* 2. Auth screens */}
      <Stack.Screen name="sign-in" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="signup" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="verification" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="username" options={{ animation: "slide_from_right" }} />

      {/* 3. Core flow */}
      <Stack.Screen name="movie-detail" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="select-seat" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="combo" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="payment" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="my-ticket" options={{ animation: "slide_from_right" }} />

      {/* 4. Profile */}
      <Stack.Screen name="change-password" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
