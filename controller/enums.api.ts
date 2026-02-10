import apiClient from "@/controller/http";

export const enumsApi = {
  getEnums: async () => {
    const res = await apiClient.get("/api/enums/");
    return res.data;
  },
};