import React from "react";

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-md w-full p-6 my-8 relative">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
}
