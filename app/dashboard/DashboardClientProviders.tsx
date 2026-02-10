"use client";

import { useNotificationsSocket } from "@/hooks/notifications/useNotificationsSocket";
import { useNotificationBroadcast } from "@/hooks/notifications/useNotificationBroadcast";

export default function DashboardClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationsSocket();
  useNotificationBroadcast();

  return <>{children}</>;
}
