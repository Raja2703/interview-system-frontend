import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/controller/notifications.api";
import { notificationKeys } from "./notifications.keys";

export const useInfiniteNotificationsQuery = () => {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({ page: pageParam }),

    getNextPageParam: (lastPage) => {
      if (!lastPage?.next) return undefined;

      const url = new URL(lastPage.next);
      return Number(url.searchParams.get("page"));
    },

    staleTime: 1000 * 60 * 5,
  });
};
