import api from "./api";

export const getMovieReviews = async (movieId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/reviews?movieId=${movieId}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { success: false, data: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
  }
};

export const addReview = async (movieId: string, rating: number, comment: string) => {
  try {
    const response = await api.post("/reviews", { movie: movieId, rating, comment });
    return response.data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, rating: number, comment: string) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
