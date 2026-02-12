"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "./notifications.keys";

export const useNotificationsSocket = () => {
  const queryClient = useQueryClient();
  const serverUrl: string = process.env.NEXT_PUBLIC_SERVER_URL || "";
  const url = new URL(serverUrl);
  const host = url.host;

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    const ws = new WebSocket(
      `ws://${host}/ws/notifications/?token=${token}`
    );

    ws.onopen = () => {
      console.log("[WS] connected");
    };

    ws.onerror = (e) => {
      console.error("[WS] error", e);
    };

    ws.onclose = (e) => {
      console.warn("[WS] closed", e.code, e.reason);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 🔔 NEW NOTIFICATION
      if (data.type === "notification") {
        queryClient.setQueriesData(
          { queryKey: notificationKeys.list() },
          (old: any) => {
            if (!old?.results) return old;
            return {
              ...old,
              results: [data.notification, ...old.results],
            };
          }
        );
      }

      // 🔢 UNREAD COUNT (optional)
      if (data.type === "unread_count") {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          { unread_count: data.count }
        );
      }
    };

    return () => ws.close();
  }, [queryClient]);
};
