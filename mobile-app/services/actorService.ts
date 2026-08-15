import api from "./api";

export const getActors = async () => {
  try {
    const response = await api.get("/actors");
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching actors:", error);
    return [];
  }
};

export const getActorById = async (id: string) => {
  try {
    const response = await api.get(`/actors/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error("Error fetching actor:", error);
    return null;
  }
};
