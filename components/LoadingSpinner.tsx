
import React from 'react';

const LoadingSpinner = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-500"></div>
      <p className="text-green-400 text-lg font-mono">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
