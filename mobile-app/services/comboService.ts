import api from "./api";

// Danh sách bắp nước / combo (CGV F&B)
export const getCombos = async () => {
  try {
    const response = await api.get("/combos");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Lỗi getCombos:", error);
    return [];
  }
};
