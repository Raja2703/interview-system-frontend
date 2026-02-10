import apiClient from "@/controller/http";

export const interviewsApi = {
  // List all requests (filtered by status in the UI or backend if supported)
  getRequests: async () => {
    const res = await apiClient.get(`/api/interviews/requests/list/`);
    return res.data;
  },

  // Get specific request details (needed to see time options for accepting)
  getRequestDetail: async (uuid: string) => {
    const res = await apiClient.get(`/api/interviews/requests/${uuid}/`);
    return res.data;
  },

  getInterviewDashboard: async () => {
    const res = await apiClient.get(`/api/interviews/dashboard/`);
    return res.data;
  },

  createRequest: async (data: {
    receiver_id: string;
    time_slots: string[];
    topic: string;
    message: string;
    duration_minutes: number;
  }) => {
    const res = await apiClient.post(`/api/interviews/requests/`, data);
    return res.data;
  },

  // Accept a request
  acceptRequest: async ({ uuid, selected_time_option_id }: { uuid: string; selected_time_option_id: string }) => {
    const res = await apiClient.post(`/api/interviews/requests/${uuid}/accept/`, {
      selected_time_option_id,
    });
    return res.data;
  },

  // Reject a request
  rejectRequest: async ({ uuid, reason }: { uuid: string; reason: string }) => {
    const res = await apiClient.post(`/api/interviews/requests/${uuid}/reject/`, {
      reason,
    });
    return res.data;
  },

  // Cancel a request
  cancelRequest: async ({ uuid, reason }: { uuid: string; reason: string }) => {
    const res = await apiClient.post(`/api/interviews/requests/${uuid}/cancel/`, {
      reason,
    });
    return res.data;
  },

  // Join Room (Get Token)
  joinRoom: async (uuid: string) => {
    const res = await apiClient.post(`/api/interviews/${uuid}/join/`);
    return res.data;
  }
};