interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl";
}

export function AdminModal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: AdminModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`bg-white rounded-xl ${maxWidth} w-full p-6 my-8 relative`}>
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
}
