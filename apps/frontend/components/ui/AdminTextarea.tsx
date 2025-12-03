import React from 'react';

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export function AdminTextarea({ className = '', theme = 'blue', ...props }: AdminTextareaProps) {
    const themeClasses = {
        blue: 'focus:ring-blue-500 focus:border-blue-500',
        green: 'focus:ring-green-500 focus:border-green-500',
        purple: 'focus:ring-purple-500 focus:border-purple-500',
        orange: 'focus:ring-orange-500 focus:border-orange-500',
    };

    return (
        <textarea
            className={`w-full px-4 py-2 rounded-lg border border-neutral-300 outline-none text-neutral-900 placeholder-neutral-500 focus:ring-2 ${themeClasses[theme]} ${className}`}
            {...props}
        />
    );
}
