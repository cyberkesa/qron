import React, { useState, useEffect } from "react";
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
  index: number;
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
  index,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const bgColor = getBgColorByType(notification.type);
  const textColor = getTextColorByType(notification.type);

  // Автоматическое закрытие с анимацией
  useEffect(() => {
    if (notification.timeout) {
      const timer = setTimeout(() => {
        setIsExiting(true);

        // Задержка перед удалением для анимации
        setTimeout(() => {
          onDismiss(notification.id);
        }, 300);
      }, notification.timeout);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  // Вычисление анимации и стилей
  const animationClass = isExiting
    ? "animate-fade-out opacity-0 transform translate-x-4"
    : "animate-fade-in-right";

  const animationDelay = index * 100;

  return (
    <div
      className={`${bgColor} border px-4 py-3 rounded-lg shadow-md flex items-start mb-3 ${animationClass} transition-all duration-300`}
      role="alert"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex-shrink-0 mr-3">
        {getIconByType(notification.type)}
      </div>
      <div className={`flex-1 ${textColor}`}>{notification.message}</div>
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 ml-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1 transition-colors ${textColor} hover-scale`}
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
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          index={index}
        />
      ))}
    </div>
  );
};

export default NotificationSystem;
