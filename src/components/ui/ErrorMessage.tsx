import React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

type ErrorType = "error" | "warning" | "info";

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  showIcon?: boolean;
  className?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message,
  type = "error",
  showIcon = true,
  className = "",
  onRetry,
}: ErrorMessageProps) {
  // Определяем стили в зависимости от типа ошибки
  const styles = {
    error: {
      container: "bg-red-50 border border-red-100 text-red-700",
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      container: "bg-yellow-50 border border-yellow-100 text-yellow-700",
      icon: "text-yellow-500",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      container: "bg-blue-50 border border-blue-100 text-blue-700",
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  return (
    <div
      className={`p-4 rounded-lg flex items-start ${styles[type].container} ${className}`}
    >
      {showIcon && (
        <XCircleIcon
          className={`w-5 h-5 mr-3 flex-shrink-0 ${styles[type].icon}`}
        />
      )}
      <div className="flex-grow">
        <div className="text-sm">{message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`mt-3 px-4 py-2 rounded-md text-sm font-medium ${styles[type].button} transition-colors`}
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}
