import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Common Loading Spinner UI component.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading roster...',
}) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};
