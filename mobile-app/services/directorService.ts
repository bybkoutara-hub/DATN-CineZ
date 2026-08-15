import api from "./api";

export const getDirectors = async () => {
  try {
    const response = await api.get("/directors");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching directors:", error);
    return [];
  }
};

export const getDirectorById = async (id: string) => {
  try {
    const response = await api.get(`/directors/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error("Error fetching director:", error);
    return null;
  }
};
