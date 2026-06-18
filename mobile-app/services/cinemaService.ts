import api from "./api";

// Danh sách cụm rạp (lọc theo thành phố nếu có)
export const getCinemas = async (city?: string) => {
  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : "";
    const response = await api.get(`/cinemas${query}`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Lỗi getCinemas:", error);
    return [];
  }
};

export const getCinemaById = async (id: string) => {
  try {
    const response = await api.get(`/cinemas/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error("Lỗi getCinemaById:", error);
    return null;
  }
};
