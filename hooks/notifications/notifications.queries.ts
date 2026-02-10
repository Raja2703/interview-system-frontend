import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { notificationsApi } from "@/controller/notifications.api";
import { notificationKeys } from "./notifications.keys";

// ---------------- TYPES ----------------
export type NotificationsQueryParams = {
  page?: number;
  is_read?: boolean;
  type?: string;
};

// ---------------- LIST QUERY ----------------
export const useNotificationsQuery = (
  params: NotificationsQueryParams = {}
) => {
  return useQuery({
    queryKey: notificationKeys.listWithParams(params),
    queryFn: () => notificationsApi.getNotifications(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ---------------- UNREAD COUNT ----------------
export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 1000 * 30, // 30 seconds
  });
};
