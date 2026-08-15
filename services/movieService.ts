import api from "./api";

// Hàm lấy phim đang chiếu
export const getNowPlayingMovies = async () => {
  try {
    const response = await api.get("/movies?status=now_playing");
    // Nhớ return response.data.data vì backend bọc trong trường 'data'
    return response.data.success ? response.data.data : [];
  } catch (error: any) {
    console.error("Lỗi chi tiết tại đây:", error.message, error.response?.status);
    return [];
  }
};

// Hàm lấy phim sắp chiếu
export const getComingSoonMovies = async () => {
  try {
    const response = await api.get("/movies?status=coming_soon");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Lỗi getComingSoonMovies:", error);
    return [];
  }
};

// Thêm hàm lấy chi tiết phim và lịch chiếu
export const getMovieDetail = async (movieId: string) => {
  try {
    const response = await api.get(`/movies/${movieId}`);
    return response.data.data; // Trả về đối tượng gồm { movie, showtimes }
  } catch (error) {
    console.error("Error fetching movie detail:", error);
    throw error;
  }
};