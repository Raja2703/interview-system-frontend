import apiClient from "@/controller/http";

type TakerQueryParams = {
  page?: number;
  search?: string;
  designation?: string;
  skill?: string;
};

export const profilesApi = {
  getTakers: async (params?: TakerQueryParams) => {
    const res = await apiClient.get(`/api/profiles/takers/`, { params });
    return res.data;
  },
};