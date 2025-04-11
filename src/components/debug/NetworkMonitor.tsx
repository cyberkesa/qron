"use client";

import { useEffect, useState } from "react";

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: number;
  type: string;
}

interface NetworkMonitorProps {
  /** Whether the monitor is enabled */
  enabled?: boolean;
  /** Threshold in ms to highlight slow requests */
  slowThreshold?: number;
  /** Maximum number of requests to keep in history */
  maxRequests?: number;
  /** Only in development mode by default */
  showInProduction?: boolean;
}

/**
 * Network request monitoring component for performance debugging
 * Only shown in development mode by default
 */
const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  enabled = true,
  slowThreshold = 1000,
  maxRequests = 50,
  showInProduction = false,
}) => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    slowRequests: 0,
    averageDuration: 0,
    totalSize: 0,
  });

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    if (!enabled) return;

    // Array to store request start times
    const requestStartTimes = new Map<string, number>();
    const requestSizes = new Map<string, number>();

    // Create observer to monitor network requests
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Create a unique key for this request
          const requestKey = `${resourceEntry.name}-${resourceEntry.startTime}`;

          // Check if it's a network request we want to track
          if (
            resourceEntry.initiatorType === "fetch" ||
            resourceEntry.initiatorType === "xmlhttprequest" ||
            resourceEntry.name.includes("graphql")
          ) {
            // Calculate duration and size
            const duration = resourceEntry.duration;
            const size = resourceEntry.transferSize || 0;

            // Store information about the request
            const newRequest: NetworkRequest = {
              url: resourceEntry.name,
              method: "GET", // We can't get the actual method from PerformanceEntry
              duration,
              size,
              status: 200, // We can't get the status from PerformanceEntry
              timestamp: Date.now(),
              type: resourceEntry.initiatorType,
            };

            // Update requests
            setRequests((prev) => {
              const updated = [newRequest, ...prev].slice(0, maxRequests);

              // Update stats
              const totalDuration = updated.reduce(
                (acc, req) => acc + req.duration,
                0,
              );
              const totalSize = updated.reduce((acc, req) => acc + req.size, 0);
              const slowCount = updated.filter(
                (req) => req.duration > slowThreshold,
              ).length;

              setStats({
                totalRequests: updated.length,
                slowRequests: slowCount,
                averageDuration: updated.length
                  ? totalDuration / updated.length
                  : 0,
                totalSize,
              });

              return updated;
            });
          }
        }
      });
    });

    // Start observing resource timing entries
    observer.observe({ entryTypes: ["resource"] });

    return () => {
      observer.disconnect();
    };
  }, [enabled, maxRequests, slowThreshold]);

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  // Don't do anything if not enabled
  if (!enabled) {
    return null;
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Network Monitor"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Network monitor panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-96 max-h-[70vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">Network Monitor</h3>
            <div className="flex space-x-4">
              <div className="text-xs">
                <span className="font-bold">{stats.totalRequests}</span>{" "}
                requests
              </div>
              <div className="text-xs">
                <span className="font-bold">{stats.slowRequests}</span> slow
              </div>
              <div className="text-xs">
                <span className="font-bold">
                  {Math.round(stats.averageDuration)}ms
                </span>{" "}
                avg
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(70vh-40px)]">
            {requests.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No requests captured yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request, index) => (
                  <div
                    key={index}
                    className={`p-3 text-xs hover:bg-gray-50 ${
                      request.duration > slowThreshold ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <div
                        className="font-medium text-blue-800 truncate max-w-[70%]"
                        title={request.url}
                      >
                        {new URL(request.url).pathname}
                      </div>
                      <div
                        className={`font-mono ${
                          request.duration > slowThreshold
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {Math.round(request.duration)}ms
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <div>{request.type}</div>
                      <div>{formatBytes(request.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default NetworkMonitor;
