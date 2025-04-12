import { useCallback, useRef, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timeout?: number;
  createdAt?: number; // Add timestamp for better tracking
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Keep track of recent notifications to prevent duplicates across rerenders
  const recentNotificationsRef = useRef<Map<string, number>>(new Map());

  // Удаление уведомления по ID
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Очистка старых ссылок на уведомления (старше 5 секунд)
  const cleanupRecentNotifications = useCallback(() => {
    const now = Date.now();
    const recentNotifications = recentNotificationsRef.current;

    // Remove notifications older than 5 seconds from tracking
    for (const [key, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > 5000) {
        recentNotifications.delete(key);
      }
    }
  }, []);

  // Добавление нового уведомления
  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      timeout: number = 3000
    ) => {
      // Create a unique key for this notification type+message
      const notificationKey = `${type}:${message}`;
      const now = Date.now();

      // Clean up old notification references
      cleanupRecentNotifications();

      // Check if we've shown this notification recently (within last 5
      // seconds)
      if (recentNotificationsRef.current.has(notificationKey)) {
        // We already showed this notification recently, don't show it again
        return '';
      }

      const id = Math.random().toString(36).substring(2, 9);
      const notification: Notification = {
        id,
        message,
        type,
        timeout,
        createdAt: now,
      };

      // Track this notification to prevent duplicates
      recentNotificationsRef.current.set(notificationKey, now);

      // Проверяем на дубликаты по сообщению и типу и ограничиваем
      // максимальное количество уведомлений
      setNotifications((prev) => {
        // Если такое уведомление уже есть, не добавляем новое
        if (prev.some((n) => n.message === message && n.type === type)) {
          return prev;
        }

        // Ограничиваем максимальное количество уведомлений до 3
        const updatedNotifications = [...prev, notification];
        if (updatedNotifications.length > 3) {
          return updatedNotifications.slice(-3); // Оставляем только последние 3
        }

        return updatedNotifications;
      });

      // Автоматическое удаление уведомления через timeout
      if (timeout > 0) {
        setTimeout(() => {
          dismissNotification(id);
        }, timeout);
      }

      return id;
    },
    [dismissNotification, cleanupRecentNotifications]
  );

  // Специализированные методы для разных типов уведомлений
  const showSuccess = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, 'success', timeout);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, 'error', timeout);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, 'info', timeout);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, timeout?: number) => {
      return showNotification(message, 'warning', timeout);
    },
    [showNotification]
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

export default useNotifications;
