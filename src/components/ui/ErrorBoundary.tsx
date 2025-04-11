"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components,
 * log errors, and display a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI on next render
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Особая обработка ошибок Apollo
    if (
      error.name === "ApolloError" ||
      error.message.includes("go.apollo.dev/c/err")
    ) {
      console.error("Apollo GraphQL error detected:", error);

      // Дополнительное логирование для ошибок Apollo
      if ("graphQLErrors" in error) {
        console.error("GraphQL Errors:", (error as any).graphQLErrors);
      }

      if ("networkError" in error) {
        console.error("Network Error:", (error as any).networkError);
      }

      // Если имеем дело с проблемой кэша, попробуем сбросить кэш Apollo
      if (
        error.message.includes("cache") ||
        (typeof window !== "undefined" && window.localStorage)
      ) {
        console.log("Attempting to clear Apollo cache...");

        // Отметим в localStorage, что была проблема с кэшем
        // Это поможет определить, если проблема повторяется
        try {
          const errorCount = parseInt(
            localStorage.getItem("apollo_cache_error_count") || "0",
            10,
          );
          localStorage.setItem(
            "apollo_cache_error_count",
            String(errorCount + 1),
          );

          // Если проблема повторяется часто, предложим пользователю очистить кэш браузера
          if (errorCount > 3) {
            console.warn(
              "Multiple Apollo cache errors detected. Consider clearing browser cache.",
            );
          }
        } catch (e) {
          // Игнорируем ошибки localStorage
        }
      }
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Настраиваем сообщение об ошибке в зависимости от типа ошибки
      let errorMessage = "Произошла ошибка при загрузке компонента.";
      let actionText = "Попробовать снова";

      // Особое сообщение для ошибок Apollo
      if (
        this.state.error &&
        (this.state.error.name === "ApolloError" ||
          this.state.error.message.includes("go.apollo.dev/c/err"))
      ) {
        errorMessage =
          "Произошла ошибка при загрузке данных с сервера. Возможно, проблема с кэшем.";
        actionText = "Сбросить кэш и повторить";
      }

      return (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-3">
            Что-то пошло не так
          </h2>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              // Для ошибок Apollo, попробуем очистить localStorage перед повторной попыткой
              if (
                this.state.error &&
                (this.state.error.name === "ApolloError" ||
                  this.state.error.message.includes("go.apollo.dev/c/err"))
              ) {
                try {
                  // Очищаем кэш Apollo, если возможно
                  if (typeof window !== "undefined") {
                    // Удаляем счетчик ошибок кэша Apollo
                    localStorage.removeItem("apollo_cache_error_count");

                    // Попытаемся перезагрузить страницу для полной очистки состояния
                    window.location.reload();
                    return;
                  }
                } catch (e) {
                  console.error("Error clearing cache:", e);
                }
              }

              // Стандартное поведение - просто сбрасываем состояние ошибки
              this.setState({ hasError: false, error: null });
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {actionText}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with an ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for better debugging
  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

export default ErrorBoundary;
