import apiClient from "@/controller/http"

export interface SelectRolePayload {
  roles: string[];
}

export const userApi = {
  // POST: Select Role
  selectRole: async (payload: SelectRolePayload) => {
    const response = await apiClient.post('/api/select-role/', payload);
    return response.data;
  },

  // GET: Check Current Roles (Optional, useful for redirecting if already set)
  getCurrentRoles: async () => {
    const response = await apiClient.get('/api/select-role/');
    return response.data;
  },
};