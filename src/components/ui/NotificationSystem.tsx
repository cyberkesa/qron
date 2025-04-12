import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  BellAlertIcon as BellAlertIconSolid,
} from '@heroicons/react/24/solid';
import { Notification, NotificationType } from '@/lib/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}

const getIconsByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        outline: <CheckCircleIcon className="h-4 w-4" />,
        solid: <CheckCircleIconSolid className="h-4 w-4" />,
      };
    case 'error':
      return {
        outline: <ExclamationCircleIcon className="h-4 w-4" />,
        solid: <ExclamationCircleIconSolid className="h-4 w-4" />,
      };
    case 'warning':
      return {
        outline: <BellAlertIcon className="h-4 w-4" />,
        solid: <BellAlertIconSolid className="h-4 w-4" />,
      };
    case 'info':
    default:
      return {
        outline: <InformationCircleIcon className="h-4 w-4" />,
        solid: <InformationCircleIconSolid className="h-4 w-4" />,
      };
  }
};

const getBgColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50';
    case 'error':
      return 'bg-red-50';
    case 'warning':
      return 'bg-amber-50';
    case 'info':
    default:
      return 'bg-gradient-to-r from-blue-50 to-blue-100';
  }
};

const getGlowColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'shadow-green-300/50';
    case 'error':
      return 'shadow-red-300/50';
    case 'warning':
      return 'shadow-amber-300/50';
    case 'info':
    default:
      return 'shadow-blue-300/50';
  }
};

const getBorderColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'border-green-400';
    case 'error':
      return 'border-red-400';
    case 'warning':
      return 'border-amber-400';
    case 'info':
    default:
      return 'border-blue-400';
  }
};

const getTextColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'text-green-700';
    case 'error':
      return 'text-red-700';
    case 'warning':
      return 'text-amber-700';
    case 'info':
    default:
      return 'text-blue-700';
  }
};

const getIconColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'warning':
      return 'text-amber-500';
    case 'info':
    default:
      return 'text-blue-500';
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  index,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = getBgColorByType(notification.type);
  const borderColor = getBorderColorByType(notification.type);
  const textColor = getTextColorByType(notification.type);
  const iconColor = getIconColorByType(notification.type);
  const icons = getIconsByType(notification.type);

  // Автоматическое закрытие с анимацией
  useEffect(() => {
    if (notification.timeout) {
      const timer = setTimeout(() => {
        if (!isHovered) {
          setIsExiting(true);
          // Задержка перед удалением для анимации
          setTimeout(() => {
            onDismiss(notification.id);
          }, 300);
        }
      }, notification.timeout);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss, isHovered]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  // Вычисление анимации и стилей
  const animationClass = isExiting
    ? 'animate-fade-out opacity-0'
    : 'animate-fade-in';

  const animationDelay = index * 50;

  return (
    <div
      className={`${bgColor} px-3 py-2 rounded-md shadow-sm ${animationClass} transition-all duration-300 w-full max-w-[280px] border border-gray-200/50 bg-opacity-80`}
      role="alert"
      style={{
        animationDelay: `${animationDelay}ms`,
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 mr-2 ${iconColor}`}>{icons.outline}</div>
        <div className={`flex-1 ${textColor} font-medium text-xs`}>
          {notification.message}
        </div>
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ml-1 hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-0.5 transition-all ${textColor}`}
          aria-label="Закрыть уведомление"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-auto flex flex-col items-center gap-2">
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
