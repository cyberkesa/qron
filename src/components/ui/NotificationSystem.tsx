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
      return 'bg-gradient-to-r from-green-50 to-green-100';
    case 'error':
      return 'bg-gradient-to-r from-red-50 to-red-100';
    case 'warning':
      return 'bg-gradient-to-r from-amber-50 to-amber-100';
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
  const glowColor = getGlowColorByType(notification.type);
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
          }, 500);
        }
      }, notification.timeout);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss, isHovered]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 500);
  };

  // Вычисление анимации и стилей
  const animationClass = isExiting
    ? 'animate-slide-out-right opacity-0'
    : 'animate-slide-in-right';

  const animationDelay = index * 100;

  return (
    <div
      className={`${bgColor} px-3 py-2 rounded-lg shadow-md ${glowColor} backdrop-blur-md ${animationClass} transition-all duration-500 w-full max-w-[280px] hover:shadow-lg border border-white/10 mb-2`}
      role="alert"
      style={{
        animationDelay: `${animationDelay}ms`,
        backdropFilter: 'blur(12px)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 mr-2.5 ${iconColor} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
        >
          {isHovered ? icons.solid : icons.outline}
        </div>
        <div
          className={`flex-1 ${textColor} font-medium text-xs leading-relaxed`}
        >
          {notification.message}
        </div>
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ml-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1 transition-all ${textColor} transform hover:scale-110 hover:rotate-90 active:scale-90`}
          aria-label="Закрыть уведомление"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 w-full bg-gray-100/50 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${borderColor.replace('border', 'bg')} rounded-full`}
          style={{
            width: isHovered ? '100%' : '0%',
            transition: isHovered
              ? 'none'
              : `width ${notification.timeout || 3000}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            boxShadow: `0 0 5px ${borderColor
              .replace('border', 'rgb')
              .replace('-400', '')}`,
          }}
        />
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
    <div className="fixed top-24 right-5 z-[9999] w-auto flex flex-col items-end gap-3 px-4">
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
