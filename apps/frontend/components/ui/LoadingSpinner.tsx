import React from 'react';

interface LoadingSpinnerProps {
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    color = "border-blue-600",
    className = "min-h-[60vh]"
}) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${color}`}></div>
        </div>
    );
};
