"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  ErrorInfo,
} from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

interface ErrorContextType {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reportError: (error: Error, info?: ErrorInfo) => void;
  clearError: () => void;
  hasError: boolean;
}

const ErrorContext = createContext<ErrorContextType>({
  error: null,
  errorInfo: null,
  reportError: () => {},
  clearError: () => {},
  hasError: false,
});

export const useErrorContext = () => useContext(ErrorContext);

interface ErrorProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ErrorProvider = ({ children, fallback }: ErrorProviderProps) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const reportError = useCallback((err: Error, info?: ErrorInfo) => {
    console.error("Error caught by ErrorProvider:", err);
    if (info) console.error("Component stack:", info.componentStack);

    // Set error state
    setError(err);
    if (info) setErrorInfo(info);

    // You could also report to an error monitoring service here
    // Example: Sentry.captureException(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  // Handle uncaught errors
  const handleGlobalError = useCallback(
    (event: ErrorEvent) => {
      reportError(event.error || new Error(event.message));
      // Prevent default browser error handling
      event.preventDefault();
    },
    [reportError],
  );

  // Handle unhandled promise rejections
  const handlePromiseRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      const error =
        typeof event.reason === "object" && event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason || "Unhandled Promise rejection"));

      reportError(error);
      // Prevent default browser error handling
      event.preventDefault();
    },
    [reportError],
  );

  // Set up global error handlers
  React.useEffect(() => {
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, [handleGlobalError, handlePromiseRejection]);

  const handleErrorBoundaryError = useCallback(
    (err: Error, info: ErrorInfo) => {
      reportError(err, info);
    },
    [reportError],
  );

  const defaultFallback = (
    <div className="p-8 bg-red-50 text-red-800 rounded-lg border border-red-200 max-w-4xl mx-auto my-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Что-то пошло не так</h2>
      <p className="mb-6">Произошла непредвиденная ошибка в приложении.</p>
      {error && (
        <div className="bg-white p-4 rounded-md mb-4 overflow-auto max-h-48">
          <p className="font-mono text-sm text-red-600">{error.toString()}</p>
          {errorInfo && (
            <pre className="mt-2 text-xs text-gray-700 overflow-auto">
              {errorInfo.componentStack}
            </pre>
          )}
        </div>
      )}
      <button
        onClick={clearError}
        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
      >
        Перезагрузить страницу
      </button>
    </div>
  );

  return (
    <ErrorContext.Provider
      value={{
        error,
        errorInfo,
        reportError,
        clearError,
        hasError: error !== null,
      }}
    >
      <ErrorBoundary
        fallback={fallback || defaultFallback}
        onError={handleErrorBoundaryError}
      >
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;
