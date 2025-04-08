import { useCallback, useState } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timeout?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Добавление нового уведомления
  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = "info",
      timeout: number = 3000,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notification: Notification = { id, message, type, timeout };

      setNotifications((prev) => [...prev, notification]);

      // Автоматическое удаление уведомления через timeout
      if (timeout > 0) {
        setTimeout(() => {
          dismissNotification(id);
        }, timeout);
      }

      return id;
    },
    [],
  );

  // Удаление уведомления по ID
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Специализированные методы для разных типов уведомлений
  const showSuccess = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, "success", timeout);
    },
    [showNotification],
  );

  const showError = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, "error", timeout);
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, "info", timeout);
    },
    [showNotification],
  );

  const showWarning = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, "warning", timeout);
    },
    [showNotification],
  );

  // Очистка всех уведомлений
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    dismissNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllNotifications,
  };
}
