import api from "./api";

export const getGenres = async () => {
  try {
    const response = await api.get("/genres");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};
