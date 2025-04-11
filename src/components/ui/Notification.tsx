import { useEffect, useState } from "react";
import {
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Notification({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: NotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsExiting(true);

        // Даем время на анимацию выхода, затем закрываем
        const exitTimer = setTimeout(() => {
          onClose();
          setIsExiting(false);
        }, 300);

        return () => clearTimeout(exitTimer);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckIcon className="h-5 w-5" />;
      case "error":
        return <XMarkIcon className="h-5 w-5" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border border-gray-200 text-gray-800";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const animationClass = isExiting
    ? "animate-fade-out opacity-0"
    : "animate-fade-in-up";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${getStyles()} rounded-lg shadow-md flex items-center space-x-3 px-4 py-3 ${animationClass} transition-all duration-300`}
      >
        <div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={() => setIsExiting(true)}
          className="ml-auto -mr-1 flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
          aria-label="Закрыть"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
