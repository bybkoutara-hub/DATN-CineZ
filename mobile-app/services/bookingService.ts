import api from "./api"; // Đường dẫn đến file cấu hình axios chung của bạn

// Hàm lấy thông tin suất chiếu (bao gồm danh sách ghế trống)
export const getShowtimeDetail = async (showtimeId: string) => {
  try {
    const response = await api.get(`/movies/showtimes/${showtimeId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching showtime detail:", error);
    throw error;
  }
};