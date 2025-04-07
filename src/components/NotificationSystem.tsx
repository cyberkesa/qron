import React from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Notification, NotificationType } from "@/lib/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const getIconByType = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case "error":
      return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
    case "warning":
      return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
    case "info":
    default:
      return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
  }
};

const getBgColorByType = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "error":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "info":
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const getTextColorByType = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "text-green-800";
    case "error":
      return "text-red-800";
    case "warning":
      return "text-yellow-800";
    case "info":
    default:
      return "text-blue-800";
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
}) => {
  const bgColor = getBgColorByType(notification.type);
  const textColor = getTextColorByType(notification.type);

  return (
    <div
      className={`${bgColor} border p-4 rounded-lg shadow-md flex items-start mb-3 animate-fade-in transition-all duration-300`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {getIconByType(notification.type)}
      </div>
      <div className={`flex-1 ${textColor}`}>{notification.message}</div>
      <button
        onClick={() => onDismiss(notification.id)}
        className={`flex-shrink-0 ml-2 ${textColor} hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1`}
        aria-label="Закрыть уведомление"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm space-y-2 w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default NotificationSystem;
