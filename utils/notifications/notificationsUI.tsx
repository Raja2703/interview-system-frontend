import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export type NotificationType =
  | "interview_created"
  | "interview_rejected"
  | string;

/**
 * Returns the icon component for a notification type
 */
export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "interview_created":
      return <CheckCircle className="text-green-600" size = { 20} />;
    case "interview_rejected":
      return <AlertTriangle className="text-red-600" size = { 20} />;
    default:
      return <Info className="text-blue-600" size = { 20} />;
  }
};

/**
 * Returns background utility class for a notification type
 */
export const getNotificationBg = (type: NotificationType) => {
  switch (type) {
    case "interview_created":
      return "bg-green-50";
    case "interview_rejected":
      return "bg-amber-50";
    default:
      return "bg-blue-50";
  }
};
