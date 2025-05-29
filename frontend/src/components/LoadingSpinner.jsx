import React from 'react';

export const LoadingSpinner = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-500`}></div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );
};
