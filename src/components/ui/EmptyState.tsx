"use client";

import { createElement, ReactNode } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  DocumentIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

/**
 * EmptyState types
 */
export type EmptyStateType =
  | "search"
  | "cart"
  | "orders"
  | "products"
  | "notification"
  | "data"
  | "custom";

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /**
   * The type of empty state
   * @default "data"
   */
  type?: EmptyStateType;

  /**
   * The title for the empty state
   */
  title: string;

  /**
   * Description text
   */
  description: string;

  /**
   * Text for the action button
   */
  actionText?: string;

  /**
   * Click handler for the action button
   */
  onAction?: () => void;

  /**
   * Custom icon as ReactNode
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show a smaller variant of the empty state
   * @default false
   */
  compact?: boolean;
}

/**
 * A flexible component for displaying empty states in the application
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "data",
  title,
  description,
  actionText,
  onAction,
  icon,
  className = "",
  compact = false,
}) => {
  // Default icons by type
  const icons: Record<EmptyStateType, ReactNode> = {
    search: <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />,
    cart: <ShoppingBagIcon className="w-10 h-10 text-gray-400" />,
    orders: <DocumentIcon className="w-10 h-10 text-gray-400" />,
    products: <InboxIcon className="w-10 h-10 text-gray-400" />,
    notification: (
      <ExclamationTriangleIcon className="w-10 h-10 text-gray-400" />
    ),
    data: <InboxIcon className="w-10 h-10 text-gray-400" />,
    custom: icon,
  };

  const IconComponent = icons[type] || icons.data;

  return (
    <div className={`${compact ? "py-5" : "py-10"} ${className}`}>
      <div
        className={`rounded-lg border border-gray-200 bg-white ${compact ? "p-4" : "p-8"} text-center flex flex-col items-center justify-center`}
      >
        <div
          className={`bg-gray-100 rounded-full p-3 mb-4 ${compact ? "w-14 h-14" : "w-16 h-16"} flex items-center justify-center`}
        >
          {IconComponent}
        </div>

        <h3
          className={`${compact ? "text-lg" : "text-xl"} font-medium text-gray-900 mb-1`}
        >
          {title}
        </h3>

        <p className="text-gray-500 max-w-md mx-auto mb-4">{description}</p>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
