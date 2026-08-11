import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCombos } from "../services/comboService";

export default function ComboScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const showtimeId = params.showtimeId as string;
  const seats = ((params.seats as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ticketTotal = Number(params.totalPrice || 0);
  const movieTitle = (params.movieTitle as string) || "Vé xem phim";
  const moviePoster = (params.moviePoster as string) || "";
  const roomName = (params.roomName as string) || "";
  const startTime = params.startTime as string;

  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCombos = async () => {
      setLoading(true);
      const data = await getCombos();
      setCombos(data);
      const initial: Record<string, number> = {};
      data.forEach((c: any) => { initial[c._id] = 0; });
      setQuantities(initial);
      setLoading(false);
    };
    fetchCombos();
  }, []);

  const updateQuantity = (id: string, type: "plus" | "minus") => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      if (type === "minus" && current === 0) return prev;
      return { ...prev, [id]: type === "plus" ? current + 1 : current - 1 };
    });
  };

  const comboAmount = useMemo(() => {
    return combos.reduce((sum, c) => sum + (quantities[c._id] || 0) * c.price, 0);
  }, [quantities, combos]);

  const grandTotal = ticketTotal + comboAmount;

  const selectedCombos = useMemo(() => {
    return combos
      .filter((c) => (quantities[c._id] || 0) > 0)
      .map((c) => ({
        name: c.name,
        quantity: quantities[c._id],
        price: c.price,
      }));
  }, [quantities, combos]);

  const comboItems = combos.filter((c) => c.name.toLowerCase().startsWith("combo"));
  const snackItems = combos.filter((c) => !c.name.toLowerCase().startsWith("combo"));

  const renderStepper = (id: string, qty: number) => (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepperBtn} onPress={() => updateQuantity(id, "minus")}>
        <AntDesign name="minus" size={16} color="#A3A3A3" />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{qty}</Text>
      <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnActive]} onPress={() => updateQuantity(id, "plus")}>
        <AntDesign name="plus" size={16} color="black" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FCC434" />
          <Text style={{ color: "#888", marginTop: 12 }}>Đang tải combo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Bắp & Nước</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.movieCard}>
          <Image source={{ uri: moviePoster || "https://via.placeholder.com/100x150" }} style={styles.moviePoster} />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>{movieTitle}</Text>
            <Text style={styles.movieDetails}>{seats.length} ghế • {ticketTotal.toLocaleString("vi-VN")} đ</Text>
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>Ghế {seats.length > 0 ? seats.join(", ") : "chưa chọn"}</Text>
            </View>
          </View>
        </View>

        {comboItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Combo Đặc Biệt</Text>
            {comboItems.map((item, idx) => (
              <View key={item._id} style={styles.itemCardRow}>
                {idx === 0 && (
                  <View style={styles.bestSellerBadge}>
                    <Text style={styles.bestSellerText}>Bán chạy</Text>
                  </View>
                )}
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImageRow} />
                ) : (
                  <View style={[styles.itemImageRow, { backgroundColor: "#2A2A2C", justifyContent: "center", alignItems: "center" }]}>
                    <MaterialCommunityIcons name="popcorn" size={36} color="#FCC434" />
                  </View>
                )}
                <View style={styles.itemDetailsRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemPriceYellow}>{item.price.toLocaleString("vi-VN")} đ</Text>
                </View>
                {renderStepper(item._id, quantities[item._id] || 0)}
              </View>
            ))}
          </>
        )}

        {snackItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{comboItems.length > 0 ? "Món Lẻ" : "Đồ uống & Snack"}</Text>
            <View style={styles.gridContainer}>
              {snackItems.map((item) => (
                <View key={item._id} style={styles.gridCard}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={[styles.imagePlaceholder, { width: "100%", height: 120 }]} contentFit="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons name="bottle-soda-classic-outline" size={48} color="#FCC434" />
                    </View>
                  )}
                  <Text style={styles.itemNameGrid}>{item.name}</Text>
                  <View style={styles.gridBottomRow}>
                    <Text style={styles.itemPriceYellowGrid}>{item.price.toLocaleString("vi-VN")} đ</Text>
                    {quantities[item._id] === 0 ? (
                      <TouchableOpacity style={styles.addBtnOutlineSmall} onPress={() => updateQuantity(item._id, "plus")}>
                        <AntDesign name="plus" size={16} color="#A3A3A3" />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepper}>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => updateQuantity(item._id, "minus")}>
                          <AntDesign name="minus" size={12} color="#A3A3A3" />
                        </TouchableOpacity>
                        <Text style={[styles.stepperValue, { marginHorizontal: 6, fontSize: 12 }]}>{quantities[item._id]}</Text>
                        <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnActive]} onPress={() => updateQuantity(item._id, "plus")}>
                          <AntDesign name="plus" size={12} color="black" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tổng cộng (vé + combo)</Text>
          <Text style={styles.footerTotal}>{grandTotal.toLocaleString("vi-VN")} đ</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            router.push({
              pathname: "/payment",
              params: {
                showtimeId,
                seats: seats.join(","),
                ticketTotal: String(ticketTotal),
                comboTotal: String(comboAmount),
                grandTotal: String(grandTotal),
                combos: JSON.stringify(selectedCombos),
                movieTitle,
                moviePoster,
                roomName,
                startTime: startTime || "",
              },
            });
          }}
        >
          <Text style={styles.checkoutBtnText}>THANH TOÁN</Text>
          <Feather name="arrow-right" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  movieCard: { flexDirection: "row", backgroundColor: "#1C1C1E", borderRadius: 16, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: "#2C2C2E" },
  moviePoster: { width: 60, height: 80, borderRadius: 8, backgroundColor: "#333" },
  movieInfo: { marginLeft: 12, justifyContent: "center", flex: 1 },
  movieTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  movieDetails: { color: "#A3A3A3", fontSize: 13, marginBottom: 8 },
  seatBadge: { alignSelf: "flex-start", borderWidth: 1, borderColor: "#444", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  seatText: { color: "#D1D1D1", fontSize: 12 },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 16 },
  itemCardRow: { flexDirection: "row", backgroundColor: "#1C1C1E", borderRadius: 16, padding: 12, marginBottom: 16, alignItems: "center", position: "relative", borderWidth: 1, borderColor: "#2C2C2E", overflow: "hidden" },
  bestSellerBadge: { position: "absolute", top: 0, right: 0, backgroundColor: "#FCC434", paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 12, zIndex: 1 },
  bestSellerText: { color: "black", fontSize: 10, fontWeight: "bold" },
  itemImageRow: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#333" },
  itemDetailsRow: { flex: 1, marginLeft: 12 },
  itemName: { color: "white", fontSize: 15, fontWeight: "600", marginBottom: 4 },
  itemDesc: { color: "#A3A3A3", fontSize: 12, marginBottom: 8 },
  itemPriceYellow: { color: "#FCC434", fontSize: 14, fontWeight: "bold" },
  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#444", borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4 },
  stepperBtn: { padding: 4, borderRadius: 12 },
  stepperBtnActive: { backgroundColor: "#FCC434" },
  stepperValue: { color: "white", fontSize: 14, fontWeight: "bold", marginHorizontal: 12 },
  gridContainer: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  gridCard: { width: "48%", backgroundColor: "#1C1C1E", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#2C2C2E" },
  imagePlaceholder: { width: "100%", height: 120, backgroundColor: "#2A2A2C", borderRadius: 8, marginBottom: 12, justifyContent: "center", alignItems: "center" },
  itemNameGrid: { color: "white", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  gridBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemPriceYellowGrid: { color: "#FCC434", fontSize: 13, fontWeight: "bold" },
  addBtnOutlineSmall: { borderWidth: 1, borderColor: "#444", borderRadius: 16, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28 },
  footerLabel: { color: "#A3A3A3", fontSize: 13, marginBottom: 4 },
  footerTotal: { color: "#FCC434", fontSize: 18, fontWeight: "bold" },
  checkoutBtn: { backgroundColor: "#FCC434", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  checkoutBtnText: { color: "black", fontSize: 15, fontWeight: "bold", marginRight: 8 },
});
