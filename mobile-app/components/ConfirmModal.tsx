import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm phải được dùng trong <ConfirmProvider>");
  return ctx;
};

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpts(options);
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setOpts(null);
    if (resolver.current) {
      resolver.current(value);
      resolver.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Modal
        visible={!!opts}
        transparent
        animationType="fade"
        onRequestClose={() => close(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconCircle, opts?.danger ? styles.iconCircleDanger : styles.iconCircleDefault]}>
              <Ionicons
                name={opts?.danger ? "trash-outline" : "help-outline"}
                size={26}
                color={opts?.danger ? "#FF4D4D" : "#E2A43B"}
              />
            </View>

            <Text style={styles.title}>{opts?.title}</Text>
            {opts?.message ? <Text style={styles.message}>{opts.message}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => close(false)}
              >
                <Text style={styles.cancelText}>{opts?.cancelText || "Hủy"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, opts?.danger && styles.confirmButtonDanger]}
                activeOpacity={0.8}
                onPress={() => close(true)}
              >
                <Text style={[styles.confirmText, opts?.danger && styles.confirmTextDanger]}>
                  {opts?.confirmText || "Xác nhận"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircleDefault: {
    backgroundColor: "rgba(226, 164, 59, 0.12)",
  },
  iconCircleDanger: {
    backgroundColor: "rgba(255, 77, 77, 0.12)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    alignSelf: "stretch",
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E2A43B",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButtonDanger: {
    backgroundColor: "#FF4D4D",
  },
  confirmTextDanger: {
    color: "#FFFFFF",
  },
});
