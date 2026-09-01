// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;