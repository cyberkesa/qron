import React from 'react';

export default function ResetPasswordLoading() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="h-8 w-2/3 mx-auto bg-gray-200 rounded-md animate-shimmer mb-8"></div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-1/4 bg-gray-200 rounded animate-shimmer"></div>
              <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-1/4 bg-gray-200 rounded animate-shimmer"></div>
              <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-1/4 bg-gray-200 rounded animate-shimmer"></div>
              <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
            </div>

            <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
