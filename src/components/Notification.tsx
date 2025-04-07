import { useEffect } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
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
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
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
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "info":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${getStyles()} rounded-lg shadow-lg flex items-center space-x-2 px-4 py-2 animate-fadeIn`}
      >
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
