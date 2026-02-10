import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/controller/notifications.api";
import { notificationKeys } from "./notifications.keys";
import { notificationChannel } from "@/hooks/notifications/notificationChannel"

// ---------------- MARK SINGLE READ ----------------
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markRead({ notification_ids: [notificationId] }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(),
      });

      const previous = queryClient.getQueryData<any>(
        notificationKeys.list()
      );

      queryClient.setQueriesData(
        { queryKey: notificationKeys.list() },
        (old: any) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((n: any) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
          };
        }
      );

      return { previous };
    },
    onSuccess: () => {
      notificationChannel.postMessage("refresh");
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueriesData(
          { queryKey: notificationKeys.list() },
          ctx.previous
        );
      }
    },
  });
};

// ---------------- MARK ALL READ ----------------
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markRead({ mark_all: true }),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(),
      });

      const previous = queryClient.getQueryData<any>(
        notificationKeys.list()
      );

      queryClient.setQueriesData(
        { queryKey: notificationKeys.list() },
        (old: any) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((n: any) => ({
              ...n,
              is_read: true,
            })),
          };
        }
      );

      return { previous };
    },
    onSuccess: () => {
      notificationChannel.postMessage("refresh");
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueriesData(
          { queryKey: notificationKeys.list() },
          ctx.previous
        );
      }
    },
  });
};
