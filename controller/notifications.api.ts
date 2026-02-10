import apiClient from "@/controller/http";

export type NotificationsQueryParams = {
  page?: number;
  is_read?: boolean;
  type?: string;
};

export const notificationsApi = {
  // GET /api/notifications/
  getNotifications: async (params?: NotificationsQueryParams) => {
    const res = await apiClient.get("/api/notifications/", { params });
    return res.data;
  },

  // GET /api/notifications/unread-count/
  getUnreadCount: async () => {
    const res = await apiClient.get("/api/notifications/unread-count/");
    return res.data;
  },

  // POST /api/notifications/mark-read/
  markRead: async (payload: {
    notification_ids?: string[];
    mark_all?: boolean;
  }) => {
    const res = await apiClient.post(
      "/api/notifications/mark-read/",
      payload
    );
    return res.data;
  },
};
