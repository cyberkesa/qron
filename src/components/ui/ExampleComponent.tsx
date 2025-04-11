"use client";

import React, { useState, useCallback } from "react";
import PerformanceMarker, {
  withPerformanceMarking,
} from "@/components/debug/PerformanceMarker";
import { useTrackedMemo } from "@/lib/hooks/useTrackedMemo";
import OptimizedImage from "./OptimizedImage";

/**
 * Example component demonstrating performance optimizations
 * This shows how to use various performance tools
 */
const ExampleComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  // Example of expensive calculation that should be memoized
  const expensiveResult = useTrackedMemo(
    () => {
      // Simulate expensive calculation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    },
    [count],
    { name: "expensiveCalculation", warnThreshold: 10 },
  );

  // Tracked callback example
  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return (
    <PerformanceMarker
      componentName="ExampleComponent"
      warnThreshold={16}
      verbose={true}
    >
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Performance Optimized Component
        </h2>

        <div className="mb-4">
          <p>Count: {count}</p>
          <p>Expensive calculation result: {expensiveResult.toFixed(2)}</p>
          <button
            onClick={handleClick}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Using OptimizedImage component */}
          <div>
            <h3 className="text-lg font-medium mb-2">Optimized Image</h3>
            <OptimizedImage
              src="https://images.qron.ru/example-image.jpg"
              alt="Example optimized image"
              width={300}
              height={200}
              placeholder="color"
              placeholderColor="#f0f0f0"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              Regular Image (for comparison)
            </h3>
            <img
              src="https://images.qron.ru/example-image.jpg"
              alt="Example regular image"
              width={300}
              height={200}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </PerformanceMarker>
  );
};

// Alternative: wrap the entire component with the HOC
// const EnhancedExampleComponent = withPerformanceMarking(ExampleComponent);

export default ExampleComponent;
