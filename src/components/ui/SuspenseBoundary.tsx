"use client";

import React, { Suspense, ReactNode } from "react";

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Delay in ms before showing loader (prevents flash for fast loads) */
  delayMs?: number;
  /** Custom class for the fallback wrapper */
  className?: string;
}

/**
 * Default loader that can be used as a fallback
 */
export const DefaultLoader = ({ className = "" }: { className?: string }) => (
  <div className={`flex justify-center items-center p-4 ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * Skeleton loader that can be used as a fallback for content
 */
export const ContentSkeleton = ({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse rounded h-4 bg-gray-200 ${
          index === 0 ? "w-3/4" : index === lines - 1 ? "w-2/3" : "w-full"
        }`}
      ></div>
    ))}
  </div>
);

/**
 * Card skeleton that can be used as a fallback for card components
 */
export const CardSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
    <div className="animate-pulse rounded-md bg-gray-200 h-32 mb-4"></div>
    <ContentSkeleton lines={3} />
  </div>
);

/**
 * A component that creates a delayed suspense boundary
 * Only shows the fallback if loading takes longer than delayMs
 */
export const DelayedSuspenseBoundary = ({
  children,
  fallback = <DefaultLoader />,
  delayMs = 500,
}: Omit<SuspenseBoundaryProps, "className">) => {
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <Suspense fallback={shouldShow ? fallback : null}>{children}</Suspense>
  );
};

/**
 * A simple wrapper around Suspense with sensible defaults
 */
const SuspenseBoundary = ({
  children,
  fallback = <DefaultLoader />,
  className = "",
  delayMs,
}: SuspenseBoundaryProps) => {
  // Use delayed boundary if delayMs is specified
  if (delayMs) {
    return (
      <DelayedSuspenseBoundary fallback={fallback} delayMs={delayMs}>
        {children}
      </DelayedSuspenseBoundary>
    );
  }

  // Regular suspense boundary
  return (
    <Suspense fallback={<div className={className}>{fallback}</div>}>
      {children}
    </Suspense>
  );
};

export default SuspenseBoundary;
