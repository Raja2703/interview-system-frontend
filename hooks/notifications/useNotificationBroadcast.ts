"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "./notifications.keys";

const channel = new BroadcastChannel("notifications");

export const useNotificationBroadcast = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    channel.onmessage = (event) => {
      if (event.data === "refresh") {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(),
        });

        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        });
      }
    };
  }, [queryClient]);
};
