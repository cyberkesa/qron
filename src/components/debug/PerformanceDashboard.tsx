"use client";

import React from "react";
import { usePerformance } from "@/lib/providers/PerformanceProvider";

/**
 * Performance dashboard component for visualizing performance metrics
 * Only shown in development mode by default and when toggled on
 */
const PerformanceDashboard: React.FC = () => {
  const {
    metrics,
    slowComponents,
    slowResources,
    appStartTime,
    isPerformanceDashboardVisible,
    togglePerformanceDashboard,
  } = usePerformance();

  if (!isPerformanceDashboardVisible) {
    return (
      <button
        onClick={togglePerformanceDashboard}
        className="fixed left-4 bottom-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Performance Dashboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }

  const formatTime = (timeMs: number | null): string => {
    if (timeMs === null) return "N/A";
    return `${timeMs.toFixed(2)}ms`;
  };

  const getMetricColor = (
    metric: number | null,
    thresholds: [number, number],
  ): string => {
    if (metric === null) return "text-gray-400";
    const [good, acceptable] = thresholds;
    if (metric <= good) return "text-green-500";
    if (metric <= acceptable) return "text-yellow-500";
    return "text-red-500";
  };

  // Thresholds based on Core Web Vitals recommendations
  const metricThresholds: Record<string, [number, number]> = {
    lcp: [2500, 4000], // ms
    fid: [100, 300], // ms
    cls: [0.1, 0.25], // unitless
    ttfb: [800, 1800], // ms
    fcp: [1800, 3000], // ms
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[1001] overflow-auto p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Performance Dashboard</h2>
          <button
            onClick={togglePerformanceDashboard}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Core Web Vitals
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Largest Contentful Paint (LCP)
                    </p>
                    <p
                      className={`text-2xl font-semibold ${getMetricColor(metrics.lcp, metricThresholds.lcp)}`}
                    >
                      {formatTime(metrics.lcp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      First Input Delay (FID)
                    </p>
                    <p
                      className={`text-2xl font-semibold ${getMetricColor(metrics.fid, metricThresholds.fid)}`}
                    >
                      {formatTime(metrics.fid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Cumulative Layout Shift (CLS)
                    </p>
                    <p
                      className={`text-2xl font-semibold ${getMetricColor(metrics.cls, metricThresholds.cls)}`}
                    >
                      {metrics.cls !== null ? metrics.cls.toFixed(3) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Time to First Byte (TTFB)
                    </p>
                    <p
                      className={`text-2xl font-semibold ${getMetricColor(metrics.ttfb, metricThresholds.ttfb)}`}
                    >
                      {formatTime(metrics.ttfb)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Load Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Page Load Metrics
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      First Contentful Paint (FCP)
                    </p>
                    <p
                      className={`text-2xl font-semibold ${getMetricColor(metrics.fcp, metricThresholds.fcp)}`}
                    >
                      {formatTime(metrics.fcp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Time to Interactive (TTI)
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatTime(metrics.tti)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Blocking Time (TBT)
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatTime(metrics.tbt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      App Started
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Date(appStartTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slow Components */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Slow Component Renders ({slowComponents.length})
              </h3>
            </div>
            {slowComponents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Component
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Render Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slowComponents.map((component, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {component.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {component.renderTime.toFixed(2)}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(component.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No slow components detected yet.
              </div>
            )}
          </div>

          {/* Slow Resources */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Slow Resources ({slowResources.length})
              </h3>
            </div>
            {slowResources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        URL
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Duration
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slowResources.map((resource, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div
                            className="truncate max-w-xs"
                            title={resource.url}
                          >
                            {resource.url}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.duration.toFixed(2)}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.initiatorType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(resource.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No slow resources detected yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
