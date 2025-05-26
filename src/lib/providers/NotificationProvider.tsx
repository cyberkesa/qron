import React, { createContext, useContext } from 'react';
import {
  useNotifications,
  Notification,
  NotificationType,
} from '@/lib/hooks/useNotifications';
import NotificationSystem from '@/components/ui/NotificationSystem';

// Создаем контекст для уведомлений
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    type?: NotificationType,
    timeout?: number
  ) => string;
  dismissNotification: (id: string) => void;
  showSuccess: (message: string, timeout?: number) => string;
  showError: (message: string, timeout?: number) => string;
  showInfo: (message: string, timeout?: number) => string;
  showWarning: (message: string, timeout?: number) => string;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Хук для удобного доступа к контексту уведомлений
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider'
    );
  }
  return context;
};

// Провайдер контекста уведомлений
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Используем хук для работы с уведомлениями
  const notificationMethods = useNotifications();

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      <NotificationSystem
        notifications={notificationMethods.notifications}
        onDismiss={notificationMethods.dismissNotification}
      />
    </NotificationContext.Provider>
  );
};
