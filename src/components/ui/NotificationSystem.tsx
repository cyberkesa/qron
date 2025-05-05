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
import {
  Notification,
  NotificationType,
  NotificationPosition,
} from '@/lib/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}

const getIconsByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        outline: <CheckCircleIcon className="h-5 w-5" />,
        solid: <CheckCircleIconSolid className="h-5 w-5" />,
      };
    case 'error':
      return {
        outline: <ExclamationCircleIcon className="h-5 w-5" />,
        solid: <ExclamationCircleIconSolid className="h-5 w-5" />,
      };
    case 'warning':
      return {
        outline: <BellAlertIcon className="h-5 w-5" />,
        solid: <BellAlertIconSolid className="h-5 w-5" />,
      };
    case 'info':
    default:
      return {
        outline: <InformationCircleIcon className="h-5 w-5" />,
        solid: <InformationCircleIconSolid className="h-5 w-5" />,
      };
  }
};

const getThemeByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-500',
        glow: 'shadow-green-200/50',
        accent: 'bg-green-500/10',
        progress: 'from-green-400 to-emerald-500',
      };
    case 'error':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500',
        glow: 'shadow-red-200/50',
        accent: 'bg-red-500/10',
        progress: 'from-red-400 to-rose-500',
      };
    case 'warning':
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-500',
        glow: 'shadow-amber-200/50',
        accent: 'bg-amber-500/10',
        progress: 'from-amber-400 to-yellow-500',
      };
    case 'info':
    default:
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-500',
        glow: 'shadow-blue-200/50',
        accent: 'bg-blue-500/10',
        progress: 'from-blue-400 to-indigo-500',
      };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  index,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const theme = getThemeByType(notification.type);
  const icons = getIconsByType(notification.type);

  // Progress bar animation effect
  useEffect(() => {
    const timeout = notification.timeout || 0;
    if (timeout > 0 && !isHovered) {
      const startTime = Date.now();
      const endTime = startTime + timeout;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const percentage = (remaining / timeout) * 100;
        setProgress(percentage);

        if (percentage > 0 && !isHovered) {
          requestAnimationFrame(updateProgress);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [notification.timeout, isHovered]);

  // Автоматическое закрытие с анимацией
  useEffect(() => {
    if (notification.timeout) {
      const timer = setTimeout(() => {
        if (!isHovered) {
          setIsExiting(true);
          // Задержка перед удалением для анимации
          setTimeout(() => {
            onDismiss(notification.id);
          }, 400);
        }
      }, notification.timeout);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss, isHovered]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 400);
  };

  // Вычисление анимации и стилей
  const translateClass = isExiting
    ? 'translate-y-1 opacity-0'
    : 'translate-y-0 opacity-100';

  const animationDelay = index * 80;

  return (
    <div
      className={`${theme.bg} group px-4 py-3 rounded-xl shadow-lg border relative overflow-hidden
        ${translateClass} transition-all duration-400 ease-in-out w-full max-w-sm backdrop-blur-sm
        transform ${theme.border} hover:shadow-xl ${theme.glow}`}
      role="alert"
      style={{
        animationDelay: `${animationDelay}ms`,
        transitionDelay: isExiting ? '0ms' : `${animationDelay}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar */}
      {notification.timeout && !isHovered && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r opacity-70 transition-all ease-linear"
          style={{
            width: `${progress}%`,
            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
          }}
        ></div>
      )}

      <div className="flex items-start">
        <div
          className={`flex-shrink-0 mr-3 p-1 rounded-full ${theme.accent} ${theme.icon} mt-0.5`}
        >
          {isHovered ? icons.solid : icons.outline}
        </div>

        <div className="flex-1 ml-1">
          {notification.title && (
            <h4 className={`font-bold text-sm mb-0.5 ${theme.text}`}>
              {notification.title}
            </h4>
          )}
          <p
            className={`${notification.title ? 'text-xs' : 'text-sm font-medium'} ${theme.text}`}
          >
            {notification.message}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ml-2 -mr-1 hover:bg-gray-500/20 rounded-full p-1.5 transition-all ${theme.text}`}
          aria-label="Закрыть уведомление"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Subtle animated glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${theme.progress} opacity-0 group-hover:opacity-5 transition-opacity duration-1000 blur-xl -z-10`}
      ></div>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: NotificationPosition;
}

const getPositionClasses = (position: NotificationPosition) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4 items-end';
    case 'top-left':
      return 'top-4 left-4 items-start';
    case 'bottom-right':
      return 'bottom-4 right-4 items-end';
    case 'bottom-left':
      return 'bottom-4 left-4 items-start';
    case 'top-center':
      return 'top-4 left-1/2 -translate-x-1/2 items-center';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
    default:
      return 'top-4 right-4 items-end';
  }
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
}) => {
  if (notifications.length === 0) return null;

  // Group notifications by position
  const notificationsByPosition = notifications.reduce(
    (acc, notification) => {
      const pos = notification.position || position;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(notification);
      return acc;
    },
    {} as Record<NotificationPosition, Notification[]>
  );

  return (
    <>
      {Object.entries(notificationsByPosition).map(([pos, notifs]) => (
        <div
          key={pos}
          className={`fixed z-[9999] flex flex-col gap-3 max-w-sm ${getPositionClasses(pos as NotificationPosition)}`}
        >
          {notifs.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              index={index}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default NotificationSystem;
