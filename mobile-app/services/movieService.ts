import api from "./api";

export const getNowPlayingMovies = async (search?: string, genre?: string) => {
  try {
    let url = "/movies?status=now_playing";
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    const response = await api.get(url);
    return response.data.success ? response.data.data : [];
  } catch (error: any) {
    console.error("Lỗi chi tiết tại đây:", error.message, error.response?.status);
    return [];
  }
};

export const getComingSoonMovies = async (search?: string, genre?: string) => {
  try {
    let url = "/movies?status=coming_soon";
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    const response = await api.get(url);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Lỗi getComingSoonMovies:", error);
    return [];
  }
};

export const getMovieDetail = async (movieId: string) => {
  try {
    const response = await api.get(`/movies/${movieId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching movie detail:", error);
    throw error;
  }
};

export const searchMovies = async (query: string, genre?: string) => {
  try {
    let url = `/mobile/movies?search=${encodeURIComponent(query)}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    const response = await api.get(url);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};