import { useCallback, useRef, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  timeout?: number;
  createdAt?: number; // Add timestamp for better tracking
  position?: NotificationPosition;
}

export interface NotificationOptions {
  timeout?: number;
  title?: string;
  position?: NotificationPosition;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [position, setPosition] = useState<NotificationPosition>('top-right');
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

  // Set global notification position
  const setNotificationPosition = useCallback(
    (newPosition: NotificationPosition) => {
      setPosition(newPosition);
    },
    []
  );

  // Добавление нового уведомления
  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      options?: NotificationOptions
    ) => {
      // Extract options with defaults
      const timeout = options?.timeout ?? 5000;
      const title = options?.title;
      const notificationPosition = options?.position ?? position;

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
        title,
        type,
        timeout,
        createdAt: now,
        position: notificationPosition,
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
        if (updatedNotifications.length > 5) {
          return updatedNotifications.slice(-5); // Оставляем только последние 5
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
    [dismissNotification, cleanupRecentNotifications, position]
  );

  // Специализированные методы для разных типов уведомлений
  const showSuccess = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'success', options);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'error', options);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'info', options);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'warning', options);
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
    setNotificationPosition,
    position,
  };
}

export default useNotifications;
