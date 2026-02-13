"use client";

import { useRouter } from "next/navigation";
import {
  useNotificationsQuery,
} from "@/hooks/notifications/notifications.queries";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/notifications/notifications.mutations";
import {getNotificationIcon, getNotificationBg} from "@/utils/notifications/notificationsUI"

export default function NotificationsPage() {
  const router = useRouter();

  const { data, isLoading } = useNotificationsQuery();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();


  const notifications = data?.results ?? [];

  const handleNotificationClick = (notif: any) => {
    // 1. Mark as read
    if (!notif.is_read) {
      markOne.mutate(notif.id);
    }

    // 2. Determine target tab
    let targetTab = 'history'; // default

    switch (notif.notification_type) {
      case 'interview_created':
        targetTab = 'pending';
        break;
      case 'interview_accepted':
      case 'interview_reminder':
        targetTab = 'accepted';
        break;
      case 'interview_rejected':
        targetTab = 'rejected';
        break;
      case 'interview_cancelled':
      case 'interview_completed':
        targetTab = 'history';
        break;
      default:
        targetTab = 'history';
    }

    // 3. Navigate
    router.push(`/dashboard/interviews?tab=${targetTab}`);
  };

  if (isLoading) {
    return (
      <div className="mt-20 text-center text-gray-500">
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="mt-1 lg:mt-15 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-900">Notifications</h1> */}
        <h3 className="text-lg text-gray-500">See all your app notifications</h3>

        <button
          onClick={() => markAll.mutate()}
          className="text-sm text-indigo-600 font-semibold hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif: any) => (
          <div
            key={notif.id}
            onClick={()=>handleNotificationClick(notif)}
            className={`p-4 rounded-xl border flex gap-4 cursor-pointer transition-all hover:shadow-sm ${
              notif.is_read
                ? "bg-white border-gray-100"
                : "bg-indigo-50/30 border-indigo-100"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBg(
                notif.notification_type
              )}`}
            >
              {getNotificationIcon(notif.notification_type)}
            </div>

            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h4
                  className={`text-sm font-bold ${
                    notif.is_read ? "text-gray-800" : "text-gray-900"
                  }`}
                >
                  {notif.title}
                </h4>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
              <p
                className={`text-sm mt-0.5 ${
                  notif.is_read
                    ? "text-gray-500"
                    : "text-gray-700 font-medium"
                }`}
              >
                {notif.message}
              </p>
            </div>

            {!notif.is_read && (
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}
