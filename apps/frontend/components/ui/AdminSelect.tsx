import React from 'react';

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export function AdminSelect({ className = '', theme = 'blue', children, ...props }: AdminSelectProps) {
    const themeClasses = {
        blue: 'focus:ring-blue-500 focus:border-blue-500',
        green: 'focus:ring-green-500 focus:border-green-500',
        purple: 'focus:ring-purple-500 focus:border-purple-500',
        orange: 'focus:ring-orange-500 focus:border-orange-500',
    };

    return (
        <select
            className={`w-full px-4 py-2 rounded-lg border border-neutral-300 outline-none text-neutral-900 focus:ring-2 ${themeClasses[theme]} ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}
