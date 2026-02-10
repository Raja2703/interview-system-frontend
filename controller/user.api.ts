import apiClient from "@/controller/http"

export const userProfileApi = {
  getUserProfile: async () => {
    const res = await apiClient.get(`/api/profile/`);
    return res.data;
  },

  updateUserProfile: async (data: any) => {
    const res = await apiClient.put(`/api/profile/update/`, data);
    return res.data;
  }
};