import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "warning" | "info";

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  success: { icon: "checkmark-circle", color: "#4CAF50", label: "Thành công" },
  error: { icon: "close-circle", color: "#FF4D4D", label: "Lỗi" },
  warning: { icon: "alert-circle", color: "#F5A623", label: "Cảnh báo" },
  info: { icon: "information-circle", color: "#E2A43B", label: "Thông báo" },
};

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải được dùng trong <ToastProvider>");
  return ctx;
};

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<ToastItem | null>(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [anim]);

  const show = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ id: Date.now(), type, message });
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(hide, duration);
    },
    [anim, hide]
  );

  const value: ToastContextValue = {
    success: (message, duration) => show("success", message, duration),
    error: (message, duration) => show("error", message, duration),
    warning: (message, duration) => show("warning", message, duration),
    info: (message, duration) => show("info", message, duration),
  };

  const config = toast ? TOAST_CONFIG[toast.type] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast && config && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.toastContainer,
              { top: insets.top + 8 },
              {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={hide}
              style={[styles.toastCard, { borderLeftColor: config.color }]}
            >
              <Ionicons name={config.icon} size={22} color={config.color} />
              <View style={styles.toastBody}>
                <Text style={[styles.toastLabel, { color: config.color }]}>{config.label}</Text>
                <Text style={styles.toastMessage} numberOfLines={3}>
                  {toast.message}
                </Text>
              </View>
              <Ionicons name="close" size={18} color="#666666" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    zIndex: 9999,
    elevation: 9999,
  },
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  toastBody: {
    flex: 1,
    marginLeft: 10,
  },
  toastLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  toastMessage: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 1,
    lineHeight: 18,
  },
});
