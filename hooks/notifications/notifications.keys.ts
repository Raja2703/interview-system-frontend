export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  listWithParams: (params: any) =>
    [...notificationKeys.list(), params] as const,
  unreadCount: () =>
    [...notificationKeys.all, "unread-count"] as const,
};
